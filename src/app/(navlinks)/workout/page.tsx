"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import WorkoutClient from "../../../components/workout/WorkoutStartClient";

export default async function Workout() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user?.id)
    .in("status", ["draft", "active"])
    .maybeSingle();

  if (session) {
    redirect(`/workout/${session.id}`);
  }

  return <WorkoutClient />;
}
