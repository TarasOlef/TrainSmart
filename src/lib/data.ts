/**
 * Capa de acceso a datos de TrainSmart.
 *
 * Hoy: datos mock + persistencia en localStorage con una pequeña latencia
 * artificial para que la UI ejercite skeletons y errores.
 *
 * Mañana: sustituir el cuerpo de estas funciones por llamadas al backend.
 * Las firmas (async) ya están preparadas para ello.
 */

import { DEFAULT_ROUTINES, MOCK_SESSIONS, PEOPLE, SUGGESTIONS } from "./mock-data";
import type {
  Exercise,
  ExerciseHistory,
  PersonId,
  SessionExercise,
  UserProfile,
  WorkoutRoutine,
  WorkoutSession,
} from "./types";
import { formatKg, uid } from "./utils";

const KEYS = {
  routines: (p: PersonId) => `ts.routines.${p}`,
  sessions: "ts.sessions",
  lastPerson: "ts.lastPerson",
  active: "ts.activeSession",
} as const;

const LATENCY_MS = 350;

function delay(ms = LATENCY_MS): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // almacenamiento lleno o bloqueado: la app sigue funcionando en memoria
  }
}

/* ------------------------------------------------------------------ */
/* Personas                                                            */
/* ------------------------------------------------------------------ */

export async function getPeople(): Promise<UserProfile[]> {
  await delay(150);
  return PEOPLE;
}

export function getLastPersonId(): PersonId | null {
  return read<PersonId>(KEYS.lastPerson);
}

export function setLastPersonId(id: PersonId): void {
  write(KEYS.lastPerson, id);
}

/* ------------------------------------------------------------------ */
/* Rutinas                                                             */
/* ------------------------------------------------------------------ */

export async function getRoutines(personId: PersonId): Promise<WorkoutRoutine[]> {
  await delay();
  const saved = read<WorkoutRoutine[]>(KEYS.routines(personId));
  const routines = saved ?? DEFAULT_ROUTINES.filter((r) => r.personId === personId);
  return [...routines].sort((a, b) => a.order - b.order);
}

export async function saveRoutines(
  personId: PersonId,
  routines: WorkoutRoutine[],
): Promise<void> {
  await delay(120);
  write(
    KEYS.routines(personId),
    routines.map((r, i) => ({ ...r, order: i })),
  );
}

/* ------------------------------------------------------------------ */
/* Sesiones (historial)                                                */
/* ------------------------------------------------------------------ */

function allSessions(): WorkoutSession[] {
  const saved = read<WorkoutSession[]>(KEYS.sessions) ?? [];
  return [...MOCK_SESSIONS, ...saved].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

export async function getSessions(personId: PersonId): Promise<WorkoutSession[]> {
  await delay();
  return allSessions().filter((s) => s.personId === personId);
}

export async function getSession(id: string): Promise<WorkoutSession | null> {
  await delay(200);
  return allSessions().find((s) => s.id === id) ?? null;
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  await delay(450);
  const saved = read<WorkoutSession[]>(KEYS.sessions) ?? [];
  write(KEYS.sessions, [...saved.filter((s) => s.id !== session.id), session]);
}

/** Última sesión completada de una persona (para la pantalla de inicio). */
export async function getLastSession(personId: PersonId): Promise<WorkoutSession | null> {
  await delay(150);
  return allSessions().find((s) => s.personId === personId && s.endedAt) ?? null;
}

/** Última vez que se hizo una rutina concreta. */
export function findLastSessionForRoutineSync(
  personId: PersonId,
  routineId: string,
): WorkoutSession | null {
  return (
    allSessions().find(
      (s) => s.personId === personId && s.routineId === routineId && s.endedAt,
    ) ?? null
  );
}

/* ------------------------------------------------------------------ */
/* Historial por ejercicio + sugerencias                               */
/* ------------------------------------------------------------------ */

export function getExerciseHistorySync(
  personId: PersonId,
  exerciseId: string,
): ExerciseHistory | null {
  const sessions = allSessions().filter((s) => s.personId === personId && s.endedAt);
  let lastSets: { weightKg: number; reps: number }[] | null = null;
  let lastPerformedAt = "";
  let bestWeightKg = 0;

  for (const session of sessions) {
    for (const ex of session.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      const done = ex.sets
        .filter((s) => s.completed && s.weightKg !== null && s.reps !== null)
        .map((s) => ({ weightKg: s.weightKg as number, reps: s.reps as number }));
      if (done.length === 0) continue;
      if (!lastSets) {
        lastSets = done;
        lastPerformedAt = session.startedAt;
      }
      bestWeightKg = Math.max(bestWeightKg, ...done.map((s) => s.weightKg));
    }
  }

  if (!lastSets) return null;

  const suggestion =
    SUGGESTIONS[exerciseId] ??
    (lastSets.every((s) => s.reps >= 10)
      ? "Posible subida: +2,5 kg"
      : `Objetivo: igualar ${Math.max(...lastSets.map((s) => s.reps))} reps en todas las series`);

  return { exerciseId, lastPerformedAt, lastSets, bestWeightKg, suggestion };
}

/* ------------------------------------------------------------------ */
/* Construcción de una sesión nueva                                    */
/* ------------------------------------------------------------------ */

function buildSessionExercise(personId: PersonId, exercise: Exercise): SessionExercise {
  const history = getExerciseHistorySync(personId, exercise.id);
  const setCount = Math.max(exercise.targetSets, history?.lastSets.length ?? 0);

  return {
    id: uid("sx"),
    exerciseId: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    note: "",
    completed: false,
    suggestion: history?.suggestion,
    sets: Array.from({ length: setCount }, (_, i) => ({
      id: uid("set"),
      weightKg: null,
      reps: null,
      completed: false,
      prevWeightKg: history?.lastSets[i]?.weightKg ?? null,
      prevReps: history?.lastSets[i]?.reps ?? null,
    })),
  };
}

export function createSession(
  personId: PersonId,
  routine: WorkoutRoutine | null,
): WorkoutSession {
  return {
    id: uid("session"),
    personId,
    routineId: routine?.id ?? null,
    routineName: routine?.name ?? "Entrenamiento libre",
    startedAt: new Date().toISOString(),
    exercises: routine
      ? routine.exercises.map((e) => buildSessionExercise(personId, e))
      : [],
  };
}

/** Añade un ejercicio suelto a una sesión (entrenamiento libre). */
export function createAdHocExercise(personId: PersonId, name: string): SessionExercise {
  const exercise: Exercise = {
    id: `libre-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    targetSets: 3,
  };
  return buildSessionExercise(personId, exercise);
}

/* ------------------------------------------------------------------ */
/* Sesión activa (recuperación tras cierre accidental)                 */
/* ------------------------------------------------------------------ */

export function loadActiveSession(): WorkoutSession | null {
  return read<WorkoutSession>(KEYS.active);
}

export function persistActiveSession(session: WorkoutSession): void {
  write(KEYS.active, session);
}

export function clearActiveSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEYS.active);
}

/* ------------------------------------------------------------------ */
/* Logros al finalizar (comparación con la sesión anterior)            */
/* ------------------------------------------------------------------ */

export function computeAchievements(session: WorkoutSession): string[] {
  const achievements: string[] = [];

  for (const ex of session.exercises) {
    const done = ex.sets.filter(
      (s) => s.completed && s.weightKg !== null && s.reps !== null,
    );
    if (done.length === 0) continue;

    const history = getExerciseHistorySync(session.personId, ex.exerciseId);
    const maxWeight = Math.max(...done.map((s) => s.weightKg as number));
    const totalReps = done.reduce((acc, s) => acc + (s.reps as number), 0);

    if (history) {
      const prevMax = Math.max(...history.lastSets.map((s) => s.weightKg));
      const prevReps = history.lastSets.reduce((acc, s) => acc + s.reps, 0);
      if (maxWeight > history.bestWeightKg) {
        achievements.push(`Mejor marca en ${ex.name}: ${formatKg(maxWeight)} kg`);
      } else if (maxWeight > prevMax) {
        achievements.push(`+${formatKg(maxWeight - prevMax)} kg en ${ex.name}`);
      } else if (maxWeight === prevMax && totalReps > prevReps) {
        const diff = totalReps - prevReps;
        achievements.push(
          diff === 1
            ? `1 repetición más en ${ex.name}`
            : `${diff} repeticiones más en ${ex.name}`,
        );
      }
    } else if (session.routineId !== null || done.length > 0) {
      // primer registro de este ejercicio
      achievements.push(`Primer registro de ${ex.name}`);
    }
  }

  return achievements.slice(0, 4);
}
