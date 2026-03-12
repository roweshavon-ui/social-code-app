import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { Resend } from "resend";

export async function GET() {
  const { data, error } = await getSupabase()
    .from("assessments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, goal, type, scores } = body;

  if (!name?.trim() || !email?.trim() || !type) {
    return NextResponse.json({ error: "Name, email, and type are required" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("assessments")
    .insert({ name, email, goal, jungian_type: type, scores })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send results email (non-blocking)
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const strengths: string[] = body.strengths ?? [];
    const challenges: string[] = body.challenges ?? [];
    const frameworks: string[] = body.frameworks ?? [];

    await resend.emails.send({
      from: "Shavi @ Social Code <shavi@joinsocialcode.com>",
      to: email,
      subject: `Your Social Code Results — You're an ${type}`,
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
          <p style="margin:4px 0 0;font-size:12px;color:#00D9C0;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Results</p>
        </td></tr>

        <tr><td style="padding:32px 40px 0;">
          <p style="margin:0 0 8px;font-size:16px;color:#94a3b8;">Hey ${name},</p>
          <h1 style="margin:0 0 24px;font-size:32px;font-weight:900;color:#00D9C0;">${type}</h1>

          ${strengths.length ? `
          <h3 style="margin:0 0 10px;font-size:11px;font-weight:700;color:#00D9C0;text-transform:uppercase;letter-spacing:1px;">Social Strengths</h3>
          <ul style="margin:0 0 24px;padding:0;list-style:none;">
            ${strengths.map((s: string) => `<li style="font-size:13px;color:#94a3b8;padding:4px 0;"><span style="color:#00D9C0;">✓</span> ${s}</li>`).join("")}
          </ul>` : ""}

          ${challenges.length ? `
          <h3 style="margin:0 0 10px;font-size:11px;font-weight:700;color:#FF6B6B;text-transform:uppercase;letter-spacing:1px;">Social Challenges</h3>
          <ul style="margin:0 0 24px;padding:0;list-style:none;">
            ${challenges.map((c: string) => `<li style="font-size:13px;color:#94a3b8;padding:4px 0;"><span style="color:#FF6B6B;">→</span> ${c}</li>`).join("")}
          </ul>` : ""}

          ${frameworks.length ? `
          <h3 style="margin:0 0 10px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Recommended Frameworks</h3>
          <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;">${frameworks.join(" · ")}</p>` : ""}

          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.05);margin:0 0 24px;"/>
          <p style="margin:0 0 32px;font-size:13px;color:#475569;line-height:1.6;">
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
  } catch (e) {
    console.error("Results email failed:", e);
  }

  return NextResponse.json(data, { status: 201 });
}
