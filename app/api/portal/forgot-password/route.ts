import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { decrypt } from "@/app/lib/encrypt";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  // Emails are AES-256-GCM encrypted with random IVs — can't query by value.
  // Fetch all portal clients and decrypt to find the match.
  const { data: allClients } = await getSupabase()
    .from("clients")
    .select("id, name, email, portal_access")
    .eq("portal_access", true);

  const client = (allClients ?? []).find(
    (c) => decrypt(c.email ?? "").toLowerCase() === normalized
  );

  // Always return ok — don't reveal whether the email exists
  if (!client) {
    return NextResponse.json({ ok: true });
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await getSupabase()
    .from("clients")
    .update({ portal_reset_token: token, portal_reset_expires: expires })
    .eq("id", client.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.joinsocialcode.com";
  const resetUrl = `${appUrl}/portal/reset-password?token=${token}`;
  const clientName = decrypt(client.name ?? "");

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Shavi @ Social Code <shavi@joinsocialcode.com>",
    to: normalized,
    subject: "Reset your Social Code portal password",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0D1825;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1825;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#131E2B;border-radius:16px;border:1px solid rgba(0,217,192,0.15);overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:22px;font-weight:900;color:#F7F9FC;">Social Code</p>
          <p style="margin:4px 0 0;font-size:12px;color:#00D9C0;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Client Portal</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:16px;color:#94a3b8;">Hey ${clientName},</p>
          <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">We received a request to reset your portal password. Click the button below — this link expires in 1 hour.</p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            <tr><td style="background:#00D9C0;border-radius:10px;">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#080F18;text-decoration:none;">RESET PASSWORD →</a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:13px;color:#475569;">If the button doesn't work, copy this link:</p>
          <p style="margin:0 0 24px;font-size:12px;color:#00D9C0;word-break:break-all;">${resetUrl}</p>
          <p style="margin:0;font-size:13px;color:#475569;">If you didn't request this, ignore this email — your password won't change.</p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:11px;color:#334155;text-align:center;">Social Code · joinsocialcode.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  });

  return NextResponse.json({ ok: true });
}
