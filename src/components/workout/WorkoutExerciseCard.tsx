import { SessionForm } from "@/src/types/schemas/workout";
import { Control, UseFormRegister, useFieldArray } from "react-hook-form";

const WorkoutExerciseCard = ({
  exercise,
  exerciseIdx,
  control,
  register,
  removeExercise,
}: {
  exercise: SessionForm["exercises"][number];
  exerciseIdx: number;
  control: Control<SessionForm>;
  register: UseFormRegister<SessionForm>;
  removeExercise: (index: number) => void;
}) => {
  const {
    fields: sets,
    append: appendSet,
    remove: removeSet,
  } = useFieldArray({
    control,
    name: `exercises.${exerciseIdx}.sets`,
  });
  return (
    <div key={exercise.id} className="p-4 border border-border rounded">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h2 className="text-lg font-semibold">{exercise.exerciseName}</h2>
        <button
          type="button"
          onClick={() => removeExercise(exerciseIdx)}
          className="ml-auto px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 active:bg-red-700"
        >
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
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
      </div>
      {exercise.sets && (
        <div className="mt-2 text-left">
          {sets.map((set, setIdx) => (
            <div
              key={set.id}
              className="flex items-center gap-2 mt-1 text-foreground"
            >
              <p>Set {setIdx + 1}:</p>
              <input
                type="number"
                {...register(
                  `exercises.${exerciseIdx}.sets.${setIdx}.targetReps`,
                  { valueAsNumber: true }
                )}
                className="w-16 px-2 py-1 border rounded text-center focus:outline-none focus:border-accent"
              />
              <p>reps at </p>
              <input
                type="number"
                {...register(
                  `exercises.${exerciseIdx}.sets.${setIdx}.targetWeightKg`,
                  { valueAsNumber: true }
                )}
                className="w-16 px-2 py-1 border rounded text-center focus:outline-none focus:border-accent"
              />
              <p>kg</p>
              <button
                type="button"
                onClick={() => removeSet(setIdx)}
                className="ml-auto px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 active:bg-red-700"
              >
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
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              appendSet({
                setNumber: sets.length + 1,
                targetReps: 0,
                actualReps: null,
                targetWeightKg: null,
                weightKg: null,
              })
            }
            className="mt-3 px-3 py-1 text-sm bg-surface border border-border rounded text-foreground rounded hover:bg-surface-hover active:bg-surface-active"
          >
            + Add Set
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkoutExerciseCard;
