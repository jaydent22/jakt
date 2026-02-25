import type { ExerciseSearchResult } from "./ExerciseSearch/ExerciseSearch";

const ExerciseCard = ({
  exercise,
  onClick,
}: {
  exercise: ExerciseSearchResult;
  onClick: () => void;
}) => {
  const muscle = exercise.muscle_name || "";
  const equipment = exercise.equipment_name || "";
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 border border-border rounded-md bg-surface hover:bg-surface-hover active:bg-surface-active text-left"
    >
      <p className="text-sm text-foreground">{exercise.name}</p>
      <p className="text-xs italic text-foreground-muted">{muscle} · {equipment}</p>
    </button>
  );
};

export default ExerciseCard;
