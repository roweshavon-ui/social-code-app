import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const key = process.env.ANTHROPIC_API_KEY?.trim();
    if (!key) {
      return NextResponse.json({ error: "Simulator is not configured." }, { status: 503 });
    }

    const { messages, system } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message ?? "API error";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    return NextResponse.json({ content: data.content?.[0]?.text ?? "" });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
