"use client";

import { useState } from "react";
import { Tables } from "../../types/database";
import WorkoutSessionEditor from "./WorkoutSessionEditor";

export type Session = Tables<"workout_sessions"> & {
  workout_exercises: (Tables<"workout_exercises"> & {
    exercises: Tables<"exercises">;
    workout_sets: Tables<"workout_sets">[];
  })[];
} & {
  name?: string;
};

const WorkoutSessionView = ({
  initialSession,
}: {
  initialSession: Session;
}) => {
  const [session, setSession] = useState(initialSession);

  if (session.status === "draft") {
    return <WorkoutSessionEditor session={session} />;
  }

  if (session.status === "active") {
    return;
  }
};

export default WorkoutSessionView;
