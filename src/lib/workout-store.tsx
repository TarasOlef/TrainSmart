"use client";

/**
 * Estado de la sesión de entrenamiento activa.
 * Se persiste en localStorage en cada cambio para poder recuperar
 * una sesión interrumpida (cierre de la app, recarga, etc.).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  clearActiveSession,
  computeAchievements,
  loadActiveSession,
  persistActiveSession,
} from "./data";
import type { ExerciseSet, SessionExercise, WorkoutSession } from "./types";
import { uid } from "./utils";

interface WorkoutState {
  /** Sesión en curso. */
  session: WorkoutSession | null;
  /** Sesión recién finalizada, pendiente de guardar en el resumen. */
  finished: WorkoutSession | null;
  /** true cuando ya se ha leído localStorage. */
  hydrated: boolean;
}

type Action =
  | { type: "HYDRATE"; session: WorkoutSession | null }
  | { type: "START"; session: WorkoutSession }
  | { type: "DISCARD" }
  | { type: "UPDATE_SET"; exerciseId: string; setId: string; patch: Partial<ExerciseSet> }
  | { type: "TOGGLE_SET"; exerciseId: string; setId: string }
  | { type: "ADD_SET"; exerciseId: string }
  | { type: "REMOVE_SET"; exerciseId: string; setId: string }
  | { type: "SET_NOTE"; exerciseId: string; note: string }
  | { type: "COMPLETE_EXERCISE"; exerciseId: string }
  | { type: "ADD_EXERCISE"; exercise: SessionExercise }
  | { type: "FINISH" }
  | { type: "CLEAR_FINISHED" };

function mapExercise(
  session: WorkoutSession,
  exerciseId: string,
  fn: (ex: SessionExercise) => SessionExercise,
): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map((ex) => (ex.id === exerciseId ? fn(ex) : ex)),
  };
}

function reducer(state: WorkoutState, action: Action): WorkoutState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, hydrated: true, session: state.session ?? action.session };
    case "START":
      return { ...state, session: action.session, finished: null };
    case "DISCARD":
      return { ...state, session: null };
    case "UPDATE_SET": {
      if (!state.session) return state;
      return {
        ...state,
        session: mapExercise(state.session, action.exerciseId, (ex) => ({
          ...ex,
          sets: ex.sets.map((s) => (s.id === action.setId ? { ...s, ...action.patch } : s)),
        })),
      };
    }
    case "TOGGLE_SET": {
      if (!state.session) return state;
      return {
        ...state,
        session: mapExercise(state.session, action.exerciseId, (ex) => ({
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id !== action.setId) return s;
            if (s.completed) return { ...s, completed: false };
            // Al completar con campos vacíos, adoptamos los valores anteriores.
            return {
              ...s,
              completed: true,
              weightKg: s.weightKg ?? s.prevWeightKg,
              reps: s.reps ?? s.prevReps,
            };
          }),
        })),
      };
    }
    case "ADD_SET": {
      if (!state.session) return state;
      return {
        ...state,
        session: mapExercise(state.session, action.exerciseId, (ex) => {
          const last = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            completed: false,
            sets: [
              ...ex.sets,
              {
                id: uid("set"),
                weightKg: last?.weightKg ?? null,
                reps: null,
                completed: false,
                prevWeightKg: null,
                prevReps: null,
              },
            ],
          };
        }),
      };
    }
    case "REMOVE_SET": {
      if (!state.session) return state;
      return {
        ...state,
        session: mapExercise(state.session, action.exerciseId, (ex) => ({
          ...ex,
          sets: ex.sets.filter((s) => s.id !== action.setId),
        })),
      };
    }
    case "SET_NOTE": {
      if (!state.session) return state;
      return {
        ...state,
        session: mapExercise(state.session, action.exerciseId, (ex) => ({
          ...ex,
          note: action.note,
        })),
      };
    }
    case "COMPLETE_EXERCISE": {
      if (!state.session) return state;
      return {
        ...state,
        session: mapExercise(state.session, action.exerciseId, (ex) => ({
          ...ex,
          completed: !ex.completed,
        })),
      };
    }
    case "ADD_EXERCISE": {
      if (!state.session) return state;
      return {
        ...state,
        session: {
          ...state.session,
          exercises: [...state.session.exercises, action.exercise],
        },
      };
    }
    case "FINISH": {
      if (!state.session) return state;
      const endedAt = new Date().toISOString();
      const durationMin = Math.max(
        1,
        Math.round(
          (new Date(endedAt).getTime() - new Date(state.session.startedAt).getTime()) / 60_000,
        ),
      );
      const finished: WorkoutSession = {
        ...state.session,
        endedAt,
        durationMin,
        achievements: computeAchievements(state.session),
      };
      return { ...state, session: null, finished };
    }
    case "CLEAR_FINISHED":
      return { ...state, finished: null };
  }
}

interface WorkoutContextValue extends WorkoutState {
  dispatch: React.Dispatch<Action>;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    session: null,
    finished: null,
    hydrated: false,
  });

  // Recuperar una posible sesión interrumpida al arrancar.
  useEffect(() => {
    dispatch({ type: "HYDRATE", session: loadActiveSession() });
  }, []);

  // Persistir cada cambio de la sesión activa.
  useEffect(() => {
    if (!state.hydrated) return;
    if (state.session) persistActiveSession(state.session);
    else clearActiveSession();
  }, [state.session, state.hydrated]);

  const value = useMemo(() => ({ ...state, dispatch }), [state]);
  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout debe usarse dentro de <WorkoutProvider>");
  return ctx;
}

/** Progreso 0..1 de la sesión según series completadas. */
export function sessionProgress(session: WorkoutSession): number {
  const all = session.exercises.flatMap((e) => e.sets);
  if (all.length === 0) return 0;
  return all.filter((s) => s.completed).length / all.length;
}

/** Kg movidos: suma de peso × repeticiones de las series completadas. */
export function sessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce(
    (total, ex) =>
      total +
      ex.sets.reduce(
        (sum, s) => (s.completed ? sum + (s.weightKg ?? 0) * (s.reps ?? 0) : sum),
        0,
      ),
    0,
  );
}

/** Series completadas de una sesión. */
export function sessionSets(session: WorkoutSession): number {
  return session.exercises.reduce(
    (n, ex) => n + ex.sets.filter((s) => s.completed).length,
    0,
  );
}

/** Hook de conveniencia para saber si hay algo pendiente. */
export function usePendingWork(session: WorkoutSession | null): boolean {
  return useCallback(() => {
    if (!session) return false;
    return session.exercises.some(
      (ex) => !ex.completed || ex.sets.some((s) => !s.completed),
    );
  }, [session])();
}
