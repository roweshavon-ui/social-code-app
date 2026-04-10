import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { sendResourceEmail } from "@/app/lib/email";
import { encrypt } from "@/app/lib/encrypt";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email?.trim().toLowerCase();
  const resource: string = body.resource?.trim() || "Fearless Approach System";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  // Deterministic hash for dedup (unique constraint); encrypted email for storage
  const emailHash = createHash("sha256").update(email).digest("hex");
  const encryptedEmail = encrypt(email);

  // Save subscriber
  const { error: insertError } = await getSupabase()
    .from("email_subscribers")
    .insert({ email: encryptedEmail, email_hash: emailHash, resource_requested: resource })
    .select()
    .single();

  // Ignore duplicate emails
  if (insertError && insertError.code !== "23505") {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  // Find the matching library item with a file
  const { data: items } = await getSupabase()
    .from("library_items")
    .select("title, file_url")
    .ilike("title", `%${resource}%`)
    .not("file_url", "is", null)
    .limit(1);

  const item = items?.[0];

  // Send email if we have a file and Resend is configured
  if (item?.file_url && process.env.RESEND_API_KEY) {
    try {
      await sendResourceEmail(email, item.title, item.file_url);
    } catch (err) {
      console.error("Email send failed:", err);
      // Don't fail the request — subscriber is saved, email just didn't send
    }
  }

  return NextResponse.json({ success: true });
}
