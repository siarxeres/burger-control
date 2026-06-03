import { Resend } from 'resend';

const NOMES_PLANO = {
  starter:    'Starter',
  pro:        'Pro',
  enterprise: 'Enterprise',
};

export async function enviarEmailConfirmacaoPagamento(email, planoId) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY não configurada');

    const nomePlano = NOMES_PLANO[planoId] || planoId;
    const resend = new Resend(apiKey);

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07)">

        <!-- cabeçalho -->
        <tr>
          <td style="background:#d85a30;padding:24px 32px">
            <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-.3px">Minha Firma</span>
          </td>
        </tr>

        <!-- corpo -->
        <tr>
          <td style="padding:36px 32px">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a1a18;letter-spacing:-.4px">
              Pagamento confirmado!
            </h1>
            <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.6">
              Seu plano <strong style="color:#d85a30">${nomePlano}</strong> está ativo. A partir de agora você tem acesso completo a todos os recursos incluídos no plano.
            </p>
            <table cellpadding="0" cellspacing="0" style="background:#fff3ee;border-radius:8px;padding:16px 20px;margin-bottom:24px;width:100%">
              <tr>
                <td style="font-size:13px;color:#d85a30;font-weight:600">
                  Plano ativado: ${nomePlano}
                </td>
              </tr>
            </table>
            <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6">
              Acesse o app a qualquer momento em <a href="https://minhafirma.app" style="color:#d85a30;text-decoration:none;font-weight:600">minhafirma.app</a> e aproveite o controle financeiro completo do seu negócio.
            </p>
            <p style="margin:0;font-size:14px;color:#666;line-height:1.6">
              Obrigado por confiar no Minha Firma. Qualquer dúvida, responda este email.
            </p>
          </td>
        </tr>

        <!-- rodapé -->
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #f0ede8">
            <p style="margin:0;font-size:12px;color:#999;line-height:1.5">
              Minha Firma &mdash; gestão financeira para pequenas empresas.<br>
              Você está recebendo este email porque realizou um pagamento em minhafirma.app.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await resend.emails.send({
      from:    'Minha Firma <nao-responda@minhafirma.app>',
      to:      email,
      subject: `Pagamento confirmado — seu plano ${nomePlano} está ativo`,
      html,
    });

    return { ok: true };
  } catch (err) {
    console.error('[email] Falha ao enviar confirmação de pagamento:', err?.message || err);
    return { ok: false };
  }
}
