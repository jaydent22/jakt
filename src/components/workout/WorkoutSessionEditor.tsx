"use client";

import { Fragment, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Tables } from "../../types/database";
import { SessionForm, SessionFormSchema } from "../../types/schemas/workout";
import { ExerciseSearchResult } from "../exercises/ExerciseSearch/ExerciseSearch";
import ExerciseSearchModal from "../exercises/ExerciseSearch/ExerciseSearchModal";
import WorkoutExerciseCard from "./WorkoutExerciseCard";

export type Session = Tables<"workout_sessions"> & {
  workout_exercises: (Tables<"workout_exercises"> & {
    exercises: Tables<"exercises">;
    workout_sets: Tables<"workout_sets">[];
  })[];
} & {
  name?: string;
};

function sessionToForm(session: Session): SessionForm {
  return {
    id: session.id,
    notes: session.notes ?? "",
    exercises: session.workout_exercises.map((we) => ({
      id: we.id,
      exerciseId: we.exercise_id ?? "",
      exerciseName: we.exercises.name ?? "",
      sets: we.workout_sets.map((set) => ({
        id: set.id,
        setNumber: set.set_number,
        actualReps: set.actual_reps,
        weightKg: set.weight_kg,
        targetReps: set.target_reps,
        targetWeightKg: set.target_weight_kg,
      })),
    })),
  };
}

const WorkoutSessionEditor = ({ session }: { session: Session }) => {
  const { register, control, handleSubmit } = useForm<SessionForm>({
    resolver: zodResolver(SessionFormSchema),
    defaultValues: sessionToForm(session),
  });

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [exerciseAction, setExerciseAction] = useState<{
    type: "insert" | "replace";
    exerciseIdx: number;
  } | null>(null);

  const {
    fields: exerciseFields,
    insert: insertExercise,
    update: updateExercise,
    remove: removeExercise,
  } = useFieldArray({
    control,
    name: "exercises",
  });

  const onSubmit = (data: SessionForm) => {
    console.log("Form data:", data);
  };

  function handleSelectExercise(exercise: ExerciseSearchResult) {
    if (!exerciseAction) return;

    const exists = exerciseFields.some(
      (ex, idx) =>
        ex.exerciseId === exercise.id && idx !== exerciseAction.exerciseIdx
    );

    if (exists) {
      alert("This exercise is already in the workout");
      return;
    }

    if (exerciseAction.type === "insert") {
      insertExercise(exerciseAction.exerciseIdx, {
        exerciseId: exercise.id ?? "",
        exerciseName: exercise.name ?? "",
        sets: [
          {
            setNumber: 0,
            targetReps: 10,
            actualReps: null,
            targetWeightKg: null,
            weightKg: null,
          },
        ],
      });
    } else if (exerciseAction.type === "replace") {
      updateExercise(exerciseAction.exerciseIdx, {
        ...exerciseFields[exerciseAction.exerciseIdx],
        exerciseId: exercise.id ?? "",
        exerciseName: exercise.name ?? "",
      });
    }

    setIsSearchModalOpen(false);
    setExerciseAction(null);
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center">
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center h-full"
    >
      <div className="w-full max-w-lg border-b border-border pb-2 mb-4">
        <h1 className="text-center text-2xl font-bold text-foreground">
          {session.name ?? `Workout Session - ${new Date().toDateString()}`}
        </h1>
        <textarea
          {...register("notes")}
          placeholder="Session notes..."
          className="w-full mt-2 p-2 rounded-lg border border-border/50 bg-surface/50 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
        />
      </div>

      <div className="flex-1 min-h-0 w-full max-w-lg space-y-2 text-center overflow-y-auto">
        {exerciseFields.map((exercise, exerciseIdx) => {
          return (
            <Fragment key={exercise.id}>
              <button
                type="button"
                onClick={() => {
                  setExerciseAction({ type: "insert", exerciseIdx });
                  setIsSearchModalOpen(true);
                }}
              >
                + Add Exercise
              </button>
              <WorkoutExerciseCard
                exercise={exercise}
                exerciseIdx={exerciseIdx}
                control={control}
                register={register}
                removeExercise={() => removeExercise(exerciseIdx)}
              />
            </Fragment>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setExerciseAction({
              type: "insert",
              exerciseIdx: exerciseFields.length,
            });
            setIsSearchModalOpen(true);
          }}
        >
          + Add Exercise
        </button>
      </div>
      {/* <div className="sticky bottom-0 z-10 w-full max-w-lg pt-6 pb-4 text-center bg-gradient-to-t from-background to-transparent backdrop-blur-lg rounded-full"> */}
      <div className="sticky bottom-0 z-10 w-full py-2 mt-2 bg-background/10 backdrop-blur-xl border-t border-border/20 rounded-full shadow-md">
        <div className="flex items-stretch justify-between max-w-lg mx-auto px-4 space-x-2">
          <button
            type="button"
            // className="px-4 py-2 text-sm rounded-full bg-surface/60 backdrop-blur-lg border border-border/20 text-foreground-muted hover:bg-surface/20 active:bg-surface-active"
            className="px-2 py-2 text-sm rounded-full text-foreground-muted active:text-foreground active:bg-surface-active"
          >
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
              <span className="text-xs">Change Day</span>
            </div>
          </button>

          <button
            type="submit"
            className="flex items-center justify-center text-xl font-semibold px-4 py-2 w-full bg-accent text-white rounded-full hover:bg-accent-hover active:bg-accent-active"
          >
            Start Workout
          </button>

          <button
            type="button"
            // className="px-4 py-2 text-sm rounded-full bg-surface/60 backdrop-blur-lg border border-border/20 text-foreground-muted hover:bg-surface/20 active:bg-surface-active"
            className="px-2 py-2 text-sm rounded-full text-foreground-muted active:text-foreground active:bg-surface-active"
          >
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <span className="text-xs">Clear Session</span>
            </div>
          </button>
        </div>
      </div>

      {/* <div className="sticky bottom-0 z-10 w-full py-2 mt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="px-4 py-2 text-sm rounded-lg bg-surface/60 backdrop-blur-lg border border-border/20 text-foreground-muted hover:bg-surface/20 active:bg-surface-active"
          >
            ← Back
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover active:bg-accent-active"
          >
            Start Workout
          </button>

          <button
            type="button"
            className="px-4 py-2 text-sm rounded-lg bg-surface/60 backdrop-blur-lg border border-border/20 text-foreground-muted hover:bg-surface/20 active:bg-surface-active"
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <p>Reset</p>
            </div>
          </button>
        </div>
      </div> */}
      <ExerciseSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setExerciseAction(null);
        }}
        onSelectExercise={handleSelectExercise}
        existingExerciseIds={exerciseFields.map((ex) => ex.exerciseId)}
      />
    </form>
  );
};

export default WorkoutSessionEditor;
