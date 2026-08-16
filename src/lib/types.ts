/**
 * Tipos de dominio de TrainSmart.
 * La capa de datos (lib/data.ts) es la única que sabe de dónde salen:
 * hoy mock + localStorage, mañana un backend real.
 */

export type PersonId = "blanca" | "taras";

export interface UserProfile {
  id: PersonId;
  name: string;
  initial: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup?: string;
  /** Número de series con las que se precarga el ejercicio al empezar. */
  targetSets: number;
}

export interface WorkoutRoutine {
  id: string;
  personId: PersonId;
  name: string;
  order: number;
  exercises: Exercise[];
}

/** Una serie dentro de una sesión (activa o guardada). */
export interface ExerciseSet {
  id: string;
  weightKg: number | null;
  reps: number | null;
  completed: boolean;
  /** Valores de la sesión anterior, para comparar y precargar. */
  prevWeightKg: number | null;
  prevReps: number | null;
}

/** Un ejercicio dentro de una sesión concreta. */
export interface SessionExercise {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup?: string;
  sets: ExerciseSet[];
  note: string;
  completed: boolean;
  /** Recomendación de sobrecarga progresiva (mock por ahora). */
  suggestion?: string;
}

export interface WorkoutSession {
  id: string;
  personId: PersonId;
  routineId: string | null;
  routineName: string;
  startedAt: string; // ISO
  endedAt?: string; // ISO
  durationMin?: number;
  exercises: SessionExercise[];
  /** Frases de logro calculadas al finalizar ("+2,5 kg en Press banca"). */
  achievements?: string[];
}

/** Resumen histórico de un ejercicio, para "Última vez" y sugerencias. */
export interface ExerciseHistory {
  exerciseId: string;
  lastPerformedAt: string;
  lastSets: { weightKg: number; reps: number }[];
  bestWeightKg: number;
  suggestion?: string;
}
