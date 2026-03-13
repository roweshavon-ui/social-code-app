import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY environment variable");
  return new Resend(key);
}

export async function sendResourceEmail(to: string, resourceName: string, fileUrl: string) {
  const { error } = await getResend().emails.send({
    from: "Shavi @ Social Code <shavi@joinsocialcode.com>",
    to,
    subject: `Here's your ${resourceName} — Crack the Code`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0D1825;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1825;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#131E2B;border-radius:16px;border:1px solid rgba(0,217,192,0.15);overflow:hidden;max-width:560px;width:100%;">

        <!-- Header -->
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:22px;font-weight:900;color:#F7F9FC;letter-spacing:-0.5px;">Social Code</p>
          <p style="margin:4px 0 0;font-size:12px;color:#00D9C0;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Crack the Code</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:16px;color:#94a3b8;line-height:1.6;">
            You asked for it. Here it is.
          </p>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#F7F9FC;line-height:1.2;">
            ${resourceName}
          </h1>
          <p style="margin:0 0 32px;font-size:14px;color:#64748b;line-height:1.6;">
            No fluff. No "just be confident." This is the actual system — built for introverts, grounded in Jungian psychology, tested through thousands of real conversations.
          </p>

          <!-- CTA Button -->
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            <tr><td style="background:#FF6B6B;border-radius:10px;">
              <a href="${fileUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:0.5px;">
                DOWNLOAD YOUR FRAMEWORK →
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;font-size:13px;color:#475569;line-height:1.6;">
            If the button doesn't work, copy this link:
          </p>
          <p style="margin:0 0 32px;font-size:12px;color:#00D9C0;word-break:break-all;">
            ${fileUrl}
          </p>

          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.05);margin:0 0 24px;"/>

          <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
            Still awkward. Still weird. Just competent.<br/>
            — Shavi, @GetSocialCode
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:11px;color:#334155;text-align:center;">
            You signed up at joinsocialcode.com · <a href="https://app.joinsocialcode.com/unsubscribe?email=${to}" style="color:#475569;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) throw new Error(error.message);
}

export async function sendClientMessage(
  to: string,
  subject: string,
  body: string,
  clientName: string
) {
  const { error } = await getResend().emails.send({
    from: "Shavi @ Social Code <shavi@joinsocialcode.com>",
    to,
    subject,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0D1825;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1825;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#131E2B;border-radius:16px;border:1px solid rgba(0,217,192,0.15);overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:22px;font-weight:900;color:#F7F9FC;letter-spacing:-0.5px;">Social Code</p>
          <p style="margin:4px 0 0;font-size:12px;color:#00D9C0;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Message from Shavi</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;">Hey ${clientName},</p>
          <div style="font-size:14px;color:#94a3b8;line-height:1.7;white-space:pre-wrap;">${body}</div>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.05);margin:32px 0 24px;"/>
          <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
            Still awkward. Still weird. Just competent.<br/>
            Shavi, @GetSocialCode
          </p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:11px;color:#334155;text-align:center;">Social Code · joinsocialcode.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) throw new Error(error.message);
}
