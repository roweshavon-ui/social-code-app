import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/app/lib/supabase";

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  const { client_id } = await req.json();
  if (!client_id) return NextResponse.json({ error: "client_id required" }, { status: 400 });

  // Fetch client + current profile
  const { data: clientData, error: clientError } = await getSupabase()
    .from("clients")
    .select("*")
    .eq("id", client_id)
    .single();

  if (clientError || !clientData) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Check if assessment record exists (prefer updating that profile too)
  const { data: assessment } = await getSupabase()
    .from("assessments")
    .select("id, behavioral_profile")
    .ilike("email", clientData.email ?? "")
    .maybeSingle();

  const currentProfile = clientData.behavioral_profile ?? assessment?.behavioral_profile;
  if (!currentProfile) {
    return NextResponse.json({ error: "No profile to update — generate one first" }, { status: 400 });
  }

  // Fetch all sessions for this client
  const { data: sessions } = await getSupabase()
    .from("sessions")
    .select("*")
    .eq("client_id", client_id)
    .order("session_number", { ascending: true });

  const sessionHistory = (sessions ?? []).map((s) => ({
    session: s.session_number,
    type: s.session_type,
    date: s.date,
    engagement: s.client_engagement,
    homework_completion: s.homework_completion,
    homework_assigned: s.homework_assigned,
    frameworks_used: s.frameworks_used,
    overview: s.notes,
    breakthrough: s.breakthrough_moment,
    observations: s.coach_observations,
    rating: s.rating,
  }));

  const latestSession = sessionHistory[sessionHistory.length - 1];
  const existingContradictions = clientData.contradiction_log ?? [];

  const prompt = `You are an expert behavioral profiler updating a coaching client's profile based on real session data.

CLIENT: ${clientData.name} (${clientData.jungian_type ?? "Unknown type"})

CURRENT BEHAVIORAL PROFILE:
${JSON.stringify(currentProfile, null, 2)}

FULL SESSION HISTORY (${sessionHistory.length} session${sessionHistory.length !== 1 ? "s" : ""} logged):
${JSON.stringify(sessionHistory, null, 2)}

Your job:
1. Update the behavioral profile to reflect what you now know from real sessions — refine needs, adjust coaching playbook, update the arc
2. Assign a progress status based on session patterns
3. Flag any contradictions between what the profile predicted and what actually happened in sessions

Generate a JSON object with EXACTLY this structure:

{
  "updated_profile": { ...the full updated behavioral profile — same structure as the current one, with coaching_playbook included and updated based on session data... },
  "progress_status": "one of: early | building | momentum | breakthrough",
  "progress_notes": "1-2 sentences on where this client actually is right now based on what you've seen",
  "contradictions": [
    {
      "session_number": 1,
      "prediction": "what the original profile predicted",
      "reality": "what actually happened",
      "implication": "what this means for how to coach them going forward"
    }
  ],
  "profile_notes": "2-3 sentences summarizing what changed in the profile and why — written for the coach"
}

Only include contradictions where the reality meaningfully differed from the prediction. Empty array is fine if everything tracked.
Return ONLY valid JSON. No markdown, no explanation, no code blocks.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const text = content.text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON found");

    const result = JSON.parse(text.slice(start, end + 1));
    const { updated_profile, progress_status, contradictions, profile_notes } = result;

    // Merge new contradictions with existing log
    const updatedContradictions = [
      ...existingContradictions,
      ...(contradictions ?? []).map((c: Record<string, string>) => ({
        ...c,
        logged_at: new Date().toISOString(),
      })),
    ];

    // Update clients table
    await getSupabase()
      .from("clients")
      .update({
        behavioral_profile: updated_profile,
        progress_status: progress_status ?? "early",
        contradiction_log: updatedContradictions,
        profile_updated_session: latestSession?.session ?? null,
      })
      .eq("id", client_id);

    // Also update assessment if one exists
    if (assessment?.id) {
      await getSupabase()
        .from("assessments")
        .update({ behavioral_profile: updated_profile })
        .eq("id", assessment.id);
    }

    return NextResponse.json({ success: true, progress_status, profile_notes, contradictions });
  } catch (e) {
    console.error("Profile update from session failed:", e);
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
  }
}
