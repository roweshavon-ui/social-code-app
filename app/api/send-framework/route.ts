export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

const FRAMEWORKS: Record<string, { label: string; file: string; color: string }> = {
  "talk-check": {
    label: "TALK Check",
    file: "TALK Check full.pdf",
    color: "#00D9C0",
  },
  "fearless-approach": {
    label: "Fearless Approach System",
    file: "Fearless Approach System full.pdf",
    color: "#4DE8D4",
  },
};

const PDF_DIR = path.join(process.cwd(), "public");

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email?.trim().toLowerCase();
  const framework = body.framework as string;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const fw = FRAMEWORKS[framework];
  if (!fw) {
    return NextResponse.json({ error: "Unknown framework" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const filePath = path.join(PDF_DIR, fw.file);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 500 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileBase64 = fileBuffer.toString("base64");

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Shavi @ Social Code <onboarding@resend.dev>",
    to: email,
    subject: `Your ${fw.label} — Social Code`,
    attachments: [
      {
        filename: fw.file,
        content: fileBase64,
      },
    ],
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
          <p style="margin:4px 0 0;font-size:12px;color:${fw.color};font-weight:600;text-transform:uppercase;letter-spacing:1px;">Crack the Code</p>
        </td></tr>

        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:16px;color:#94a3b8;line-height:1.6;">You asked for it. Here it is.</p>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#F7F9FC;line-height:1.2;">${fw.label}</h1>
          <p style="margin:0 0 32px;font-size:14px;color:#64748b;line-height:1.6;">
            No fluff. No "just be confident." This is the actual system — built for introverts, grounded in Jungian psychology, tested through thousands of real conversations. The PDF is attached to this email.
          </p>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.05);margin:0 0 24px;"/>
          <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
            Still awkward. Still weird. Just competent.<br/>
            Shavi, @GetSocialCode
          </p>
        </td></tr>

        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;font-size:11px;color:#334155;text-align:center;">Social Code · getsocialcode.com</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) {
    console.error("Resend error:", JSON.stringify(error));
    return NextResponse.json({ error: "Failed to send email", detail: error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
