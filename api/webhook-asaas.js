export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Método não permitido' });

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

    // 2. Atualiza perfil no Supabase via REST (service role — ignora RLS)
    const updateResp = await fetch(
      `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`,
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

    return res.status(200).json({ ok: true, plano: planoId, email });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno: ' + err.message });
  }
}
