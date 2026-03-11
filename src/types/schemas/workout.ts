import { z } from "zod";

export const SessionFormSchema = z.object({
  id: z.string().optional(),
  notes: z.string().optional(),
  exercises: z.array(
    z.object({
      id: z.string().optional(),
      exerciseId: z.string(),
      exerciseName: z.string(),
      sets: z.array(
        z.object({
          id: z.string().optional(),
          setNumber: z.number(),
          targetReps: z.number().nullable(),
          actualReps: z.number().nullable(),
          targetWeightKg: z.number().nullable(),
          weightKg: z.number().nullable(),
        })
      ),
    })
  ),
});

export type SessionForm = z.infer<typeof SessionFormSchema>;
