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
  const { name, email, goal, type, scores, answer_map } = body;

  if (!name?.trim() || !email?.trim() || !type) {
    return NextResponse.json({ error: "Name, email, and type are required" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("assessments")
    .insert({ name, email, goal, jungian_type: type, scores, answer_map })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Generate behavioral profile synchronously — Vercel kills fire-and-forget after response
  if (data?.id && answer_map) {
    try {
      const baseUrl = req.nextUrl.origin;
      await fetch(`${baseUrl}/api/generate-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_id: data.id }),
      });
    } catch (e) {
      console.error("Profile generation failed silently:", e);
    }
  }

  // Send results email (non-blocking)
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const strengths: string[] = body.strengths ?? [];
    const challenges: string[] = body.challenges ?? [];
    const description: string = body.description ?? "";

    const LETTER_MEANINGS: Record<string, [string, string]> = {
      E: ["E", "Extroversion — you gain energy from people and external engagement"],
      I: ["I", "Introversion — you recharge through solitude and internal processing"],
      S: ["S", "Sensing — you focus on concrete facts, details, and what's real"],
      N: ["N", "Intuition — you focus on patterns, meaning, and possibilities"],
      T: ["T", "Thinking — you make decisions through logic and objective analysis"],
      F: ["F", "Feeling — you make decisions through values and how people are affected"],
      J: ["J", "Judging — you prefer structure, plans, and closure"],
      P: ["P", "Perceiving — you prefer flexibility, spontaneity, and open options"],
    };

    const acronymRows = type.split("").map((letter: string) => {
      const [l, meaning] = LETTER_MEANINGS[letter] ?? [letter, ""];
      return `<tr>
        <td style="padding:8px 12px;font-size:20px;font-weight:900;color:#00D9C0;width:32px;vertical-align:top;">${l}</td>
        <td style="padding:8px 12px;font-size:13px;color:#94a3b8;line-height:1.5;">${meaning}</td>
      </tr>`;
    }).join("");

    const strengthRows = strengths.map((s: string) =>
      `<li style="font-size:13px;color:#94a3b8;padding:5px 0;line-height:1.5;"><span style="color:#00D9C0;margin-right:8px;">✓</span>${s}</li>`
    ).join("");

    const challengeRows = challenges.map((c: string) =>
      `<li style="font-size:13px;color:#94a3b8;padding:5px 0;line-height:1.5;"><span style="color:#FF6B6B;margin-right:8px;">→</span>${c}</li>`
    ).join("");

    const workOnRows = challenges.map((c: string) =>
      `<li style="font-size:13px;color:#94a3b8;padding:5px 0;line-height:1.5;"><span style="color:#4DE8D4;margin-right:8px;">·</span>${c}</li>`
    ).join("");

    const { error: emailError } = await resend.emails.send({
      from: "Shavi @ Social Code <shavi@joinsocialcode.com>",
      to: email,
      subject: `Your Social Type Results — You're an ${type}`,
      html: `<!DOCTYPE html>
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

        <tr><td style="padding:32px 40px;">

          <p style="margin:0 0 6px;font-size:15px;color:#94a3b8;">Hey ${name},</p>
          <p style="margin:0 0 24px;font-size:13px;color:#64748b;">Here's your full Social Code breakdown.</p>

          <!-- Type badge -->
          <div style="background:rgba(0,217,192,0.08);border:1px solid rgba(0,217,192,0.2);border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
            <p style="margin:0 0 4px;font-size:42px;font-weight:900;color:#00D9C0;letter-spacing:4px;">${type}</p>
            <p style="margin:8px 0 0;font-size:13px;color:#64748b;line-height:1.6;">${description}</p>
          </div>

          <!-- What the letters mean -->
          <h3 style="margin:0 0 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">What Your Type Means</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1825;border-radius:10px;margin-bottom:24px;">
            ${acronymRows}
          </table>

          <!-- Strengths -->
          <h3 style="margin:0 0 12px;font-size:11px;font-weight:700;color:#00D9C0;text-transform:uppercase;letter-spacing:1px;">Social Strengths</h3>
          <ul style="margin:0 0 24px;padding:0;list-style:none;">${strengthRows}</ul>

          <!-- Challenges -->
          <h3 style="margin:0 0 12px;font-size:11px;font-weight:700;color:#FF6B6B;text-transform:uppercase;letter-spacing:1px;">Social Challenges</h3>
          <ul style="margin:0 0 24px;padding:0;list-style:none;">${challengeRows}</ul>

          <!-- What to work on -->
          <h3 style="margin:0 0 12px;font-size:11px;font-weight:700;color:#4DE8D4;text-transform:uppercase;letter-spacing:1px;">What To Work On</h3>
          <p style="margin:0 0 10px;font-size:13px;color:#64748b;">These are your development areas — the things that, if you improve them, will have the biggest impact on your social life:</p>
          <ul style="margin:0 0 24px;padding:0;list-style:none;">${workOnRows}</ul>

          <!-- Book a call -->
          <div style="background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.2);border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
            <p style="margin:0 0 6px;font-size:15px;font-weight:800;color:#F7F9FC;">Know your type. Now do something with it.</p>
            <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;line-height:1.6;">Book a free 30-minute call with Shavi. You'll get a personalized plan based on your ${type} type — specific frameworks, specific gaps, specific next steps.</p>
            <a href="https://calendly.com/roweshavon/30min" target="_blank" style="display:inline-block;background:#FF6B6B;color:#fff;text-decoration:none;font-size:13px;font-weight:700;padding:12px 28px;border-radius:10px;letter-spacing:0.3px;">
              Book Your Free Call →
            </a>
            <p style="margin:10px 0 0;font-size:11px;color:#475569;">30 minutes · Free · No pressure</p>
          </div>

          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.05);margin:0 0 24px;"/>
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
    if (emailError) console.error("Resend error:", JSON.stringify(emailError));
  } catch (e) {
    console.error("Results email failed:", JSON.stringify(e));
  }

  return NextResponse.json(data, { status: 201 });
}
