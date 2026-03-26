"use client";
import { useState } from "react";

import { saveWorkoutDraft } from "../../lib/actions/workout";

import WorkoutSelectorModal from "./WorkoutSelectorModal";

const WorkoutClient = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 text-center items-center">
      <h1 className="text-4xl font-bold text-accent mb-4">Workout</h1>

      <div className="flex flex-col flex-1 justify-center items-center h-full">
        <h1 className="text-xl text-foreground font-semibold mb-6">
          No active workout sessions
        </h1>
        <h1 className="text-lg text-foreground-muted italic mb-6">
          Start a new workout session to track your progress and stay on top of
          your fitness goals!
        </h1>

        <button
          role="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-accent text-white rounded-full hover:bg-accent-hover active:bg-accent-active w-full md:w-auto mt-6"
        >
          Start Workout
        </button>

        <WorkoutSelectorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={async ({ programId, dayId }) => {
            saveWorkoutDraft({ programId, dayId });
          }}
        />
      </div>
    </div>
  );
};

export default WorkoutClient;
