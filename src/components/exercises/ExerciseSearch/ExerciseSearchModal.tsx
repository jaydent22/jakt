import { useState } from "react";

import Modal from "../../Modal";
import ExerciseSearch, { ExerciseSearchResult } from "./ExerciseSearch";

const ExerciseSearchModal = ({
  isOpen,
  onClose,
  onSelectExercise,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseSearchResult) => void;
}) => {
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseSearchResult | null>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSelectedExercise(null);
        onClose();
      }}
      scrollable
    >
      {selectedExercise && (
        <div className="mb-4 p-4 border rounded-md bg-secondary">
          <h3 className="text-lg font-semibold">{selectedExercise.name}</h3>
          <p className="text-sm text-foreground-muted">
            {selectedExercise.muscle_group_name} |{" "}
            {selectedExercise.equipment_name}
          </p>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto mt-4">
        <ExerciseSearch
          onSelectExercise={(exercise) => setSelectedExercise(exercise)}
          muscleGroups={[]}
          equipment={[]}
        />
      </div>
      <div className="sticky bottom-0 bg-background pt-3 mt-4 w-full border-t border-border">
        <button
          type="button"
          className="w-full px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover active:bg-accent-active"
          onClick={() => onSelectExercise(selectedExercise!)}
        >
          Select
        </button>
      </div>
    </Modal>
  );
};
export default ExerciseSearchModal;
