import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { hashPassword, generateTempPassword } from "@/app/lib/portalAuth";
import { Resend } from "resend";

function isAdmin(req: NextRequest) {
  const token = req.cookies.get("sc_admin")?.value;
  return token === process.env.ADMIN_TOKEN;
}

async function sendInviteEmail(email: string, name: string, tempPassword: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.joinsocialcode.com";
  const loginUrl = `${appUrl}/portal/login`;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Shavi @ Social Code <shavi@joinsocialcode.com>",
    to: email,
    subject: "You're in — your Social Code client portal is ready",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0D1825;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1825;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#131E2B;border-radius:16px;border:1px solid rgba(0,217,192,0.15);overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:22px;font-weight:900;color:#F7F9FC;">Social Code</p>
          <p style="margin:4px 0 0;font-size:12px;color:#00D9C0;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Client Portal Access</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:16px;color:#94a3b8;">Hey ${name},</p>
          <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">Your client portal is ready. Log in to see your tasks, session notes, and resources — all in one place.</p>
          <div style="background:#1A2332;border-radius:12px;padding:20px;margin:0 0 28px;border:1px solid rgba(0,217,192,0.1);">
            <p style="margin:0 0 8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Your login details</p>
            <p style="margin:0 0 4px;font-size:14px;color:#94a3b8;">Email: <strong style="color:#F7F9FC;">${email}</strong></p>
            <p style="margin:0;font-size:14px;color:#94a3b8;">Temp password: <strong style="color:#00D9C0;font-family:monospace;">${tempPassword}</strong></p>
          </div>
          <p style="margin:0 0 24px;font-size:13px;color:#64748b;">You'll be asked to set your own password after your first login.</p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="background:#FF6B6B;border-radius:10px;">
              <a href="${loginUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;">ACCESS YOUR PORTAL →</a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Still awkward. Still weird. Just competent.<br/>— Shavi, @GetSocialCode</p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:11px;color:#334155;text-align:center;">Social Code · joinsocialcode.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId, action } = await req.json();
  if (!clientId) {
    return NextResponse.json({ error: "clientId required" }, { status: 400 });
  }

  const { data: client } = await getSupabase()
    .from("clients")
    .select("name, email")
    .eq("id", clientId)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Revoke access
  if (action === "revoke") {
    await getSupabase()
      .from("clients")
      .update({ portal_access: false })
      .eq("id", clientId);
    return NextResponse.json({ ok: true });
  }

  // Grant or reset — both generate a new temp password
  const tempPassword = generateTempPassword();

  await getSupabase()
    .from("clients")
    .update({
      portal_access: true,
      portal_password_hash: hashPassword(tempPassword),
      force_password_change: true,
      portal_reset_token: null,
      portal_reset_expires: null,
    })
    .eq("id", clientId);

  if (client.email) {
    try {
      await sendInviteEmail(client.email, client.name, tempPassword);
    } catch (err) {
      // Don't fail — return tempPassword so admin can share manually
      console.error("Failed to send invite email:", err);
    }
  }

  return NextResponse.json({ ok: true, tempPassword });
}
