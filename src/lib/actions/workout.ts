"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import type { Tables } from "../../types/database";

export async function createOrUpdateWorkoutDraft(formData: FormData) {
  const supabase = await createClient();

  const dayId = formData.get("dayId") as string;
  console.log("Received dayId:", dayId);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Fetch program day
  const { data: day, error: dayError } = await supabase
    .from("program_days")
    .select("*")
    .eq("id", dayId)
    .single();

  if (dayError) {
    throw new Error("Program day not found");
  }

  // Check for existing draft session for the user
  const { data: existingSession } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "draft")
    .maybeSingle();

  let session;
  if (existingSession) {
    const { data } = await supabase
      .from("workout_sessions")
      .update({ program_day_id: dayId })
      .eq("id", existingSession.id)
      .select("*")
      .single();
    session = data;
  } else {
    const { data } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: user.id,
        program_id: day.program_id,
        program_day_id: dayId,
        status: "draft",
      })
      .select("*")
      .single();
    session = data;
  }

  redirect(`/workout/${session!.id}`);
}
