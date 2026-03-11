import { createClient } from "../../../../lib/supabase/server";
import WorkoutSessionEditor, {
  type Session,
} from "@/src/components/workout/WorkoutSessionEditor";

export default async function WorkoutSessionPage({
  params,
}: {
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

  session["name"] = await supabase
    .from("program_days")
    .select("name")
    .eq("id", session.program_day_id)
    .single()
    .then((res) => res.data?.name);

  if (session.status === "draft") {
    return <WorkoutSessionEditor session={session} />;
  }
}
