"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import type { Tables, TablesInsert } from "../../types/database";

async function createWorkoutExercises(session: Tables<"workout_sessions">) {
  const supabase = await createClient();

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
          "Exercise not found for workout exercise: ",templateExercise.exercise_id
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

  const { error: setsError } = await supabase.from("workout_sets").insert(sets);

  if (setsError) {
    throw new Error(setsError.message || "Failed to create workout sets");
  }
}

export async function saveWorkoutDraft(formData: FormData) {
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
  // If not existing draft, create one
  if (!existingSession) {
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
  } else {
    const { data } = await supabase
      .from("workout_sessions")
      .update({ program_day_id: dayId })
      .eq("id", existingSession.id)
      .select("*")
      .single();
    session = data;
  }

  await createWorkoutExercises(session);

  redirect(`/workout/${session!.id}`);
}

export async function deleteWorkoutDraft(sessionId: string) {
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

  redirect("/workout");
}
