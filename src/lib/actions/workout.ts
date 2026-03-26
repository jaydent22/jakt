"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import type { Tables, TablesInsert } from "../../types/database";
import { revalidatePath } from "next/cache";

async function createWorkoutExercises(session: Tables<"workout_sessions">) {
  const supabase = await createClient();

  if (session.program_day_id) {
    const { data: templateExercises, error: fetchError } = await supabase
      .from("program_day_exercises")
      .select("*, exercises (id, name)")
      .eq("program_day_id", session.program_day_id)
      .order("sort_order", { ascending: true });

    if (fetchError || !templateExercises) {
      console.error("Error fetching exercises:", fetchError);
      throw new Error("Failed to fetch exercises for workout session");
    }

    const workoutExercises = templateExercises.map((templateExercise) => ({
      workout_session_id: session.id,
      exercise_id: templateExercise.exercise_id,
      sort_order: templateExercise.sort_order,
    }));

    const { data: exercises, error: exercisesError } = await supabase
      .from("workout_exercises")
      .insert(workoutExercises)
      .select("*");

    if (exercisesError) {
      throw new Error(
        exercisesError.message || "Failed to create workout exercises"
      );
    }

    const sets: TablesInsert<"workout_sets">[] = templateExercises.flatMap(
      (templateExercise) => {
        const exercise = exercises.find(
          (ex) => ex.exercise_id === templateExercise.exercise_id
        );

        if (!exercise) {
          console.error(
            "Exercise not found for workout exercise: ",
            templateExercise.exercise_id
          );
          throw new Error("Failed to create workout sets");
        }

        return Array.from({ length: templateExercise.target_sets }, (_, i) => ({
          workout_exercise_id: exercise.id,
          set_number: i + 1,
          target_reps: templateExercise.target_reps,
          weight_kg: null,
        }));
      }
    );

    const { error: setsError } = await supabase
      .from("workout_sets")
      .insert(sets);

    if (setsError) {
      throw new Error(setsError.message || "Failed to create workout sets");
    }
  } else {
    console.warn(
      "No program day associated with session, skipping exercise creation"
    );
  }
}

async function deleteWorkoutExercises(sessionId: string) {
  const supabase = await createClient();

  const { error: exercisesError } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("workout_session_id", sessionId);

  if (exercisesError) {
    console.error("Error deleting workout exercises:", exercisesError);
    throw new Error("Failed to delete workout exercises");
  }
}

async function createSession(
  userId: string,
  programId: string | null,
  dayId: string | null
) {
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: userId,
      program_id: programId ?? null,
      program_day_id: dayId ?? null,
      status: "draft",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create workout session");
  }

  if (dayId) {
    await createWorkoutExercises(session);
  }

  return session;
}

async function updateSession(
  sessionId: string,
  programId: string | null,
  dayId: string | null
) {
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .update({ program_id: programId ?? null, program_day_id: dayId ?? null })
    .eq("id", sessionId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to update workout session");
  }

  await deleteWorkoutExercises(sessionId);

  if (dayId) {
    await createWorkoutExercises(session);
  }

  return session;
}

export async function deleteSession(sessionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  await supabase
    .from("workout_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .eq("status", "draft");
}

export async function clearSession(sessionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  await deleteWorkoutExercises(sessionId);

  const { error } = await supabase
    .from("workout_sessions")
    .update({ program_day_id: null })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .eq("status", "draft");

  if (error) {
    throw new Error(error.message || "Failed to clear workout session");
  }

  redirect(`/workout/${sessionId}`);
}

export async function saveWorkoutDraft({
  programId,
  dayId,
  existingSessionId,
}: {
  programId: string | null,
  dayId: string | null,
  existingSessionId?: string
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  console.log("Received dayId:", dayId);

  let session;
  if (!existingSessionId) {
    session = await createSession(user.id, programId, dayId);
  } else {
    session = await updateSession(existingSessionId, programId, dayId);
  }

  revalidatePath("/workout", "layout");
  redirect(`/workout/${session!.id}`);
}
