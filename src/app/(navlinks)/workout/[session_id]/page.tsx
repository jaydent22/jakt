import { createClient } from "../../../../lib/supabase/server";
import WorkoutSessionView from "../../../../components/workout/WorkoutSessionView";

export default async function WorkoutSessionPage({ params }: {
  params: { session_id: string };
}) {
  const slug = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessionId = slug.session_id;

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .select(
      `
        *,
        workout_exercises(
        *,
        exercises(*),
        workout_sets(*)
        )
    `
    )
    .eq("id", sessionId)
    .eq("user_id", user?.id)
    .single();

  let name: string | null = null;

  if (session?.program_day_id) {
    const { data } = await supabase
      .from("program_days")
      .select("name")
      .eq("id", session.program_day_id)
      .single();
    name = data?.name || null;
  }

  session["name"] = name;

  // session["name"] = await supabase
  //   .from("program_days")
  //   .select("name")
  //   .eq("id", session.program_day_id)
  //   .single()
  //   .then((res) => res.data?.name);

  return <WorkoutSessionView initialSession={session} />;
}
