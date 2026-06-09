import crypto from 'crypto';
import { enviarEmailConfirmacaoPagamento } from './_lib/email.js';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Método não permitido' });

  // Verifica se a chamada veio mesmo do Asaas (confere o token do header)
  const tokenRecebido = req.headers['asaas-access-token'] || '';
  const tokenEsperado = process.env.ASAAS_WEBHOOK_TOKEN || '';
  const aBuf = Buffer.from(tokenRecebido);
  const bBuf = Buffer.from(tokenEsperado);
  if (
    !tokenEsperado ||
    aBuf.length !== bBuf.length ||
    !crypto.timingSafeEqual(aBuf, bBuf)
  ) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_KEY;
  const asaasKey    = process.env.ASAAS_API_KEY;

  if (!supabaseUrl || !serviceKey)
    return res.status(500).json({ error: 'Variáveis de ambiente ausentes.' });

  const payload = req.body;
  const event   = payload?.event;

  // Só processa pagamentos confirmados
  if (!['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'].includes(event))
    return res.status(200).json({ ignored: true });

  const subscriptionId = payload?.payment?.subscription;
  if (!subscriptionId)
    return res.status(200).json({ ignored: true, reason: 'pagamento avulso' });

  try {
    // 1. Busca assinatura no Asaas para ler externalReference (planoId|email)
    const subResp = await fetch(
      `https://www.asaas.com/api/v3/subscriptions/${subscriptionId}`,
      { headers: { 'access_token': asaasKey } }
    );
    const sub = await subResp.json();
    const extRef = sub.externalReference || '';
    const [planoId, email] = extRef.split('|');

    if (!planoId || !email)
      return res.status(200).json({ ignored: true, reason: 'externalReference inválido' });

    // 2. Localiza o perfil: tenta primeiro por asaas_customer_id, cai para email como fallback
    const asaasCustomerId = payload?.payment?.customer || null;
    let profileFilter = `email=eq.${encodeURIComponent(email)}`;
    if (asaasCustomerId) {
      const chkResp = await fetch(
        `${supabaseUrl}/rest/v1/profiles?asaas_customer_id=eq.${encodeURIComponent(asaasCustomerId)}&select=id&limit=1`,
        { headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` } }
      );
      const chkData = await chkResp.json();
      if (Array.isArray(chkData) && chkData.length > 0)
        profileFilter = `asaas_customer_id=eq.${encodeURIComponent(asaasCustomerId)}`;
    }

    const updateResp = await fetch(
      `${supabaseUrl}/rest/v1/profiles?${profileFilter}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ plano: planoId })
      }
    );

    if (!updateResp.ok) {
      const err = await updateResp.text();
      return res.status(500).json({ error: 'Falha ao atualizar plano: ' + err });
    }

    try {
      await enviarEmailConfirmacaoPagamento(email, planoId);
    } catch (emailErr) {
      console.error('[webhook] Erro inesperado ao enviar email:', emailErr?.message || emailErr);
    }

    return res.status(200).json({ ok: true, plano: planoId, email });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno: ' + err.message });
  }
}
