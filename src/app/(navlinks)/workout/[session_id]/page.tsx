import { Tables } from "@/src/types/database";
import { createClient } from "../../../../lib/supabase/server";

type Session = Tables<"workout_sessions"> & {
  workout_exercises: (Tables<"workout_exercises"> & {
    exercises: Tables<"exercises">;
    workout_sets: Tables<"workout_sets">[];
  })[];
};

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

  const { data, error } = await supabase
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

    const session = data as Session;

  console.log("Fetched session:", session);

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4 text-red-500">
          Workout Session Not Found
        </h1>
        <p className="text-foreground-muted italic">
          The workout session you are looking for does not exist or you do not
          have access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4 text-foreground">
        Workout Session: {session.id}
      </h1>
      <p className="text-foreground-muted">Status: {session.status}</p>
      <div className="mt-6 w-full max-w-lg">
        {session.workout_exercises.map((we: any) => (
          <div key={we.id} className="p-4 border rounded mb-4">
            <h2 className="text-lg font-semibold">{we.exercises.name}</h2>
            <p className="text-sm text-foreground-muted">
              Exercise ID: {we.exercises.id}
            </p>
            {we.workout_sets && (
              <div className="mt-2">
                <h3 className="text-sm font-medium">Sets:</h3>
                {we.workout_sets.map((set: any, index: number) => (
                  <div key={index} className="ml-4">
                    <p className="text-sm">
                      Set {set.set_number}: {set.target_reps} reps at{" "}
                      {set.weight_kg || "bodyweight"} kg
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
