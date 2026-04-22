import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { rateLimit, rateLimitResponse } from "@/app/lib/rateLimit";
import { signUnsubscribeToken } from "@/app/api/unsubscribe/route";

const SendFrameworkSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional(),
  framework: z.string().min(1).max(50),
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

const BASE_URL = "https://app.joinsocialcode.com";

const FAS_URL = `${BASE_URL}/${encodeURIComponent("Fearless Approach System full.pdf")}`;
const TALK_URL = `${BASE_URL}/${encodeURIComponent("TALK Check full.pdf")}`;

// Both FAS and TALK Check are delivered together as a free bundle.
// "stop-replaying" is no longer free — it redirects to Gumroad.
const BUNDLE_KEYS = new Set(["fearless-approach", "talk-check", "bundle"]);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(`send-framework:${ip}`, 3, 60_000);
  if (!allowed) return rateLimitResponse();

  const parsed = SendFrameworkSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400, headers: CORS });
  }
  const email = parsed.data.email.trim().toLowerCase();
  const name = parsed.data.name?.trim() ?? "";
  const framework = parsed.data.framework;

  // Handle coaching waitlist separately
  if (framework === "coaching-waitlist") {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Shavi @ Social Code <shavi@joinsocialcode.com>",
      to: "shavi@joinsocialcode.com",
      replyTo: email,
      subject: `Coaching waitlist: ${name || email}`,
      html: `<p><strong>Name:</strong> ${name || "not provided"}</p><p><strong>Email:</strong> ${email}</p>`,
    });
    await resend.emails.send({
      from: "Shavi @ Social Code <shavi@joinsocialcode.com>",
      to: email,
      replyTo: "shavi@joinsocialcode.com",
      subject: "You're on the Social Code coaching waitlist",
      html: `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0D1825;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1825;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#131E2B;border-radius:16px;border:1px solid rgba(0,217,192,0.15);max-width:560px;width:100%;">
<tr><td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.05);">
  <p style="margin:0;font-size:22px;font-weight:900;color:#F7F9FC;">Social Code</p>
  <p style="margin:4px 0 0;font-size:12px;color:#00D9C0;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Coaching Waitlist</p>
</td></tr>
<tr><td style="padding:32px 40px;">
  <p style="margin:0 0 16px;font-size:16px;color:#F7F9FC;font-weight:700;">You're on the list${name ? `, ${name}` : ""}.</p>
  <p style="margin:0 0 16px;font-size:14px;color:#94a3b8;line-height:1.7;">When a coaching spot opens up, you'll hear from me directly. I'll send you the details, what we'd work on, and how to book a call if it feels right.</p>
  <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">In the meantime, grab the free framework bundle if you haven't yet. It'll give you something to work with right now.</p>
  <table cellpadding="0" cellspacing="0">
    <tr><td style="background:#00D9C0;border-radius:10px;">
      <a href="https://joinsocialcode.com" target="_blank" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#0D1825;text-decoration:none;">Get the free bundle →</a>
    </td></tr>
  </table>
  <p style="margin:24px 0 0;font-size:13px;color:#475569;">Shavi, @GetSocialCode</p>
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
  <p style="margin:0;font-size:11px;color:#334155;text-align:center;">Social Code · joinsocialcode.com</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
    });
    try {
      const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      await db.from("leads").insert({ email, name: name || null, framework: "coaching-waitlist" });
    } catch {}
    return NextResponse.json({ success: true }, { headers: CORS });
  }

  if (!BUNDLE_KEYS.has(framework)) {
    return NextResponse.json({ error: "Unknown framework" }, { status: 400, headers: CORS });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500, headers: CORS });
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Shavi @ Social Code <shavi@joinsocialcode.com>",
    to: email,
    replyTo: "shavi@joinsocialcode.com",
    subject: "Your Free Social Code Bundle — FAS + TALK Check",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0D1825;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1825;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#131E2B;border-radius:16px;border:1px solid rgba(0,217,192,0.15);overflow:hidden;max-width:560px;width:100%;">

        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:22px;font-weight:900;color:#F7F9FC;letter-spacing:-0.5px;">Social Code</p>
          <p style="margin:4px 0 0;font-size:12px;color:#00D9C0;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Free Bundle</p>
        </td></tr>

        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:16px;color:#94a3b8;line-height:1.6;">${name ? `Hey ${name} —` : "You asked for it."} Here it is.</p>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#F7F9FC;line-height:1.2;">Two frameworks. Start with TALK Check.</h1>
          <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.6;">
            No fluff. No "just be confident." These are actual systems — built for introverts, grounded in Jungian psychology, tested through real conversations.<br/><br/>
            <strong style="color:#F7F9FC;">Start with TALK Check</strong> — it's the fastest to use in the real world. Then move to the Fearless Approach System for deeper work.
          </p>

          <!-- TALK Check button -->
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#00D9C0;text-transform:uppercase;letter-spacing:1px;">Start here</p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
            <tr><td style="background:#00D9C0;border-radius:10px;">
              <a href="${TALK_URL}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#0D1825;text-decoration:none;letter-spacing:0.5px;">
                DOWNLOAD: TALK Check →
              </a>
            </td></tr>
          </table>

          <!-- FAS button -->
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#4DE8D4;text-transform:uppercase;letter-spacing:1px;">Then this</p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            <tr><td style="background:rgba(77,232,212,0.12);border:1px solid rgba(77,232,212,0.3);border-radius:10px;">
              <a href="${FAS_URL}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#4DE8D4;text-decoration:none;letter-spacing:0.5px;">
                DOWNLOAD: Fearless Approach System →
              </a>
            </td></tr>
          </table>

          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.05);margin:0 0 24px;"/>

          <!-- Stop Replaying upsell -->
          <div style="background:#1A2332;border:1px solid rgba(255,107,107,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#FF6B6B;text-transform:uppercase;letter-spacing:1px;">Next step</p>
            <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#F7F9FC;">Still replaying conversations after you close these?</p>
            <p style="margin:0 0 16px;font-size:13px;color:#64748b;line-height:1.6;">
              Stop Replaying is the system for that. Turn 3 days of rumination into 10 minutes of processing.<br/>
              E-Book + 30-Day Implementation Workbook — $17.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr><td style="background:#FF6B6B;border-radius:8px;">
                <a href="https://8864150412757.gumroad.com/l/obzgfd" target="_blank" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:700;color:#fff;text-decoration:none;">
                  Get Stop Replaying — $17 →
                </a>
              </td></tr>
            </table>
          </div>

          <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
            Still awkward. Still weird. Just competent.<br/>
            Shavi, @GetSocialCode
          </p>
        </td></tr>

        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:11px;color:#334155;text-align:center;">Social Code · joinsocialcode.com · <a href="https://app.joinsocialcode.com/unsubscribe?email=${encodeURIComponent(email)}&token=${signUnsubscribeToken(email)}" style="color:#475569;">Unsubscribe</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) {
    console.error("Resend error:", JSON.stringify(error));
    return NextResponse.json({ error: "Failed to send email", detail: error }, { status: 500, headers: CORS });
  }

  // Save lead to Supabase (non-blocking)
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase.from("leads").insert({ email, name: name || null, framework: "bundle" });
  } catch (e) {
    console.error("Lead save failed:", e);
  }

  // Add to Kit with free-bundle tag (non-blocking)
  try {
    const kitKey = process.env.KIT_API_KEY;
    if (kitKey) {
      // Create/update subscriber
      const subRes = await fetch("https://api.kit.com/v4/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Kit-Api-Key": kitKey },
        body: JSON.stringify({ email_address: email, first_name: name || undefined }),
      });
      const subData = await subRes.json();
      const subscriberId = subData?.subscriber?.id;

      // Tag the subscriber
      await fetch(`https://api.kit.com/v4/tags/17469031/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Kit-Api-Key": kitKey },
        body: JSON.stringify({ email_address: email }),
      });
    }
  } catch (e) {
    console.error("Kit subscribe failed:", e);
  }

  return NextResponse.json({ success: true }, { headers: CORS });
}
