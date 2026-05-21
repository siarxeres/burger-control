export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Chave Asaas não configurada.' });

  const { cliente, email, cpfcnpj, planoId, valor, ciclo, metodo, descricao } = req.body || {};

  if (!cliente || !email || !cpfcnpj || !planoId || !valor || !metodo)
    return res.status(400).json({ error: 'Campos obrigatórios: cliente, email, cpfcnpj, planoId, valor, metodo.' });

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return res.status(400).json({ error: 'Email inválido.' });

  const cleanDoc = cpfcnpj.replace(/\D/g, '');
  if (cleanDoc.length !== 11 && cleanDoc.length !== 14)
    return res.status(400).json({ error: 'CPF (11 dígitos) ou CNPJ (14 dígitos) inválido.' });

  const billingType = { pix: 'PIX', boleto: 'BOLETO', cartao: 'CREDIT_CARD' }[metodo] || 'PIX';
  const cycle = ciclo === 'YEARLY' ? 'YEARLY' : 'MONTHLY';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDueDate = tomorrow.toISOString().split('T')[0];

  const base = 'https://www.asaas.com/api/v3';
  const hdrs = { 'Content-Type': 'application/json', 'access_token': apiKey };

  try {
    // 1. Busca ou cria customer pelo email (evita duplicatas)
    let customerId;
    const search = await fetch(`${base}/customers?email=${encodeURIComponent(email)}&limit=1`, { headers: hdrs });
    const searchData = await search.json();

    if (searchData.data?.length > 0) {
      customerId = searchData.data[0].id;
    } else {
      const create = await fetch(`${base}/customers`, {
        method: 'POST', headers: hdrs,
        body: JSON.stringify({ name: cliente, email, cpfCnpj: cleanDoc })
      });
      const createData = await create.json();
      if (!create.ok) throw new Error(createData.errors?.[0]?.description || 'Falha ao criar cliente.');
      customerId = createData.id;
    }

    // 2. Cria assinatura recorrente
    const subResp = await fetch(`${base}/subscriptions`, {
      method: 'POST', headers: hdrs,
      body: JSON.stringify({
        customer: customerId,
        billingType,
        value: Number(valor),
        nextDueDate,
        cycle,
        description: descricao || `Plano ${planoId} - Minha Firma`,
        externalReference: `${planoId}|${email}`
      })
    });
    const sub = await subResp.json();
    if (!subResp.ok)
      return res.status(subResp.status).json({ error: sub.errors?.[0]?.description || 'Falha ao criar assinatura.' });

    // 3. Busca link de pagamento da assinatura
    //    Para PIX/Boleto, o link está no primeiro pagamento gerado automaticamente
    let paymentLink = sub.invoiceUrl || sub.paymentLink || null;

    if (!paymentLink && sub.id) {
      const pmtResp = await fetch(`${base}/payments?subscription=${sub.id}&limit=1`, { headers: hdrs });
      const pmtData = await pmtResp.json();
      const pmt = pmtData.data?.[0];
      if (pmt) paymentLink = pmt.invoiceUrl || pmt.bankSlipUrl || pmt.pixQrCodeUrl || null;
    }

    return res.status(200).json({ paymentLink, subscriptionId: sub.id });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno: ' + err.message });
  }
}
