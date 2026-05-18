export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave Asaas não configurada.' });
  }

  const { cliente, email, valor, vencimento, tipo } = req.body || {};
  if (!cliente || !email || !valor || !vencimento || !tipo) {
    return res.status(400).json({ error: 'Dados incompletos. Forneça cliente, email, valor, vencimento e tipo.' });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Email do cliente inválido.' });
  }

  const billingTypeMap = {
    pix: 'PIX',
    boleto: 'BOLETO',
    cartao: 'CREDIT_CARD'
  };
  const billingType = billingTypeMap[tipo] || 'PIX';

  const createCustomer = async () => {
    const body = {
      name: cliente,
      email,
      externalReference: `app-${Date.now()}`
    };

    const response = await fetch('https://www.asaas.com/api/v3/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.description || data.message || 'Falha ao criar cliente Asaas.');
    }
    return data.id || data.objectId || data.customerId || data; // fallback
  };

  try {
    const customerId = await createCustomer();

    const paymentBody = {
      customer: customerId,
      billingType,
      dueDate: vencimento,
      value: Number(valor),
      description: `Cobrança para ${cliente}`,
      externalReference: `cobranca-${Date.now()}`
    };

    const paymentResp = await fetch('https://www.asaas.com/api/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey
      },
      body: JSON.stringify(paymentBody)
    });

    const paymentData = await paymentResp.json();
    if (!paymentResp.ok) {
      return res.status(paymentResp.status).json({ error: paymentData.errors?.[0]?.description || paymentData.message || 'Falha ao criar cobrança.' });
    }

    const link = paymentData.invoiceUrl || paymentData.secureUrl || paymentData.bankSlipUrl || paymentData.paymentLink || paymentData.url || null;
    return res.status(200).json({ link, details: paymentData });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno: ' + err.message });
  }
}
