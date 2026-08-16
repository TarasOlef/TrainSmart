import type {
  PersonId,
  UserProfile,
  WorkoutRoutine,
  WorkoutSession,
} from "./types";

export const PEOPLE: UserProfile[] = [
  { id: "blanca", name: "Blanca", initial: "B" },
  { id: "taras", name: "Taras", initial: "T" },
];

/* ------------------------------------------------------------------ */
/* Rutinas por defecto (editables desde "Rutinas")                     */
/* ------------------------------------------------------------------ */

export const DEFAULT_ROUTINES: WorkoutRoutine[] = [
  {
    id: "blanca-push",
    personId: "blanca",
    name: "Push",
    order: 0,
    exercises: [
      { id: "b-press-banca", name: "Press banca", muscleGroup: "Pecho", targetSets: 3 },
      { id: "b-press-militar", name: "Press militar mancuernas", muscleGroup: "Hombro", targetSets: 3 },
      { id: "b-fondos", name: "Fondos asistidos", muscleGroup: "Tríceps", targetSets: 3 },
      { id: "b-elev-laterales", name: "Elevaciones laterales", muscleGroup: "Hombro", targetSets: 4 },
    ],
  },
  {
    id: "blanca-pull",
    personId: "blanca",
    name: "Pull",
    order: 1,
    exercises: [
      { id: "b-jalon", name: "Jalón al pecho", muscleGroup: "Espalda", targetSets: 3 },
      { id: "b-remo-mancuerna", name: "Remo con mancuerna", muscleGroup: "Espalda", targetSets: 3 },
      { id: "b-face-pull", name: "Face pull", muscleGroup: "Hombro posterior", targetSets: 3 },
      { id: "b-curl-biceps", name: "Curl de bíceps", muscleGroup: "Bíceps", targetSets: 3 },
    ],
  },
  {
    id: "blanca-legs",
    personId: "blanca",
    name: "Legs",
    order: 2,
    exercises: [
      { id: "b-sentadilla", name: "Sentadilla", muscleGroup: "Cuádriceps", targetSets: 4 },
      { id: "b-peso-muerto-rumano", name: "Peso muerto rumano", muscleGroup: "Femoral", targetSets: 3 },
      { id: "b-zancadas", name: "Zancadas", muscleGroup: "Glúteo", targetSets: 3 },
      { id: "b-gemelo", name: "Elevación de gemelo", muscleGroup: "Gemelo", targetSets: 4 },
    ],
  },
  {
    id: "taras-upper",
    personId: "taras",
    name: "Upper",
    order: 0,
    exercises: [
      { id: "t-press-banca", name: "Press banca", muscleGroup: "Pecho", targetSets: 4 },
      { id: "t-dominadas", name: "Dominadas lastradas", muscleGroup: "Espalda", targetSets: 4 },
      { id: "t-press-militar", name: "Press militar", muscleGroup: "Hombro", targetSets: 3 },
      { id: "t-remo-barra", name: "Remo con barra", muscleGroup: "Espalda", targetSets: 3 },
    ],
  },
  {
    id: "taras-lower",
    personId: "taras",
    name: "Lower",
    order: 1,
    exercises: [
      { id: "t-sentadilla", name: "Sentadilla trasera", muscleGroup: "Cuádriceps", targetSets: 4 },
      { id: "t-peso-muerto", name: "Peso muerto", muscleGroup: "Cadena posterior", targetSets: 3 },
      { id: "t-prensa", name: "Prensa inclinada", muscleGroup: "Cuádriceps", targetSets: 3 },
      { id: "t-femoral-tumbado", name: "Curl femoral tumbado", muscleGroup: "Femoral", targetSets: 3 },
    ],
  },
  {
    id: "taras-fullbody",
    personId: "taras",
    name: "Full body",
    order: 2,
    exercises: [
      { id: "t-sentadilla-frontal", name: "Sentadilla frontal", muscleGroup: "Cuádriceps", targetSets: 3 },
      { id: "t-press-inclinado", name: "Press inclinado", muscleGroup: "Pecho", targetSets: 3 },
      { id: "t-remo-polea", name: "Remo en polea", muscleGroup: "Espalda", targetSets: 3 },
      { id: "t-plancha", name: "Plancha con lastre", muscleGroup: "Core", targetSets: 3 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Sugerencias de progresión (mock, por ejercicio)                     */
/* ------------------------------------------------------------------ */

export const SUGGESTIONS: Record<string, string> = {
  "b-press-banca": "Posible subida: +2,5 kg",
  "b-press-militar": "Objetivo: igualar 10 reps en todas las series",
  "b-fondos": "Objetivo: reducir asistencia 5 kg",
  "b-elev-laterales": "Objetivo: 12 reps limpias",
  "b-jalon": "Posible subida: +2,5 kg",
  "b-sentadilla": "Objetivo: 4 series de 8",
  "b-peso-muerto-rumano": "Posible subida: +2,5 kg",
  "t-press-banca": "Posible subida: +2,5 kg",
  "t-dominadas": "Objetivo: +1 rep por serie",
  "t-sentadilla": "Objetivo: igualar 8 reps en todas las series",
  "t-peso-muerto": "Posible subida: +5 kg",
  "t-prensa": "Posible subida: +10 kg",
};

/* ------------------------------------------------------------------ */
/* Historial mock: sesiones ya completadas                             */
/* ------------------------------------------------------------------ */

function daysAgo(days: number, hour = 18, min = 30): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

interface MockSetInput {
  w: number;
  r: number;
  done?: boolean;
}

let mockIdCounter = 0;

function mockExercise(
  exerciseId: string,
  name: string,
  muscleGroup: string,
  sets: MockSetInput[],
  note = "",
): WorkoutSession["exercises"][number] {
  return {
    id: `mock-ex-${mockIdCounter++}`,
    exerciseId,
    name,
    muscleGroup,
    note,
    completed: sets.every((s) => s.done !== false),
    sets: sets.map((s, i) => ({
      id: `mock-set-${mockIdCounter}-${i}`,
      weightKg: s.w,
      reps: s.r,
      completed: s.done !== false,
      prevWeightKg: null,
      prevReps: null,
    })),
  };
}

function finish(
  session: Omit<WorkoutSession, "endedAt" | "durationMin">,
  durationMin: number,
): WorkoutSession {
  const end = new Date(session.startedAt);
  end.setMinutes(end.getMinutes() + durationMin);
  return { ...session, endedAt: end.toISOString(), durationMin };
}

export const MOCK_SESSIONS: WorkoutSession[] = [
  // ---------- Blanca ----------
  finish(
    {
      id: "s-blanca-push-1",
      personId: "blanca",
      routineId: "blanca-push",
      routineName: "Push",
      startedAt: daysAgo(2, 18, 10),
      achievements: ["+2,5 kg en Press banca", "Mejor marca en Elevaciones laterales"],
      exercises: [
        mockExercise("b-press-banca", "Press banca", "Pecho", [
          { w: 40, r: 10 },
          { w: 40, r: 9 },
          { w: 40, r: 8 },
        ]),
        mockExercise(
          "b-press-militar",
          "Press militar mancuernas",
          "Hombro",
          [
            { w: 10, r: 10 },
            { w: 10, r: 9 },
            { w: 10, r: 8 },
          ],
          "Bajar más despacio en la última serie.",
        ),
        mockExercise("b-fondos", "Fondos asistidos", "Tríceps", [
          { w: 25, r: 10 },
          { w: 25, r: 8 },
          { w: 25, r: 7, done: false },
        ]),
        mockExercise("b-elev-laterales", "Elevaciones laterales", "Hombro", [
          { w: 6, r: 12 },
          { w: 6, r: 12 },
          { w: 6, r: 11 },
          { w: 6, r: 10 },
        ]),
      ],
    },
    52,
  ),
  finish(
    {
      id: "s-blanca-pull-1",
      personId: "blanca",
      routineId: "blanca-pull",
      routineName: "Pull",
      startedAt: daysAgo(4, 19, 0),
      achievements: ["2 repeticiones más en Jalón al pecho"],
      exercises: [
        mockExercise("b-jalon", "Jalón al pecho", "Espalda", [
          { w: 37.5, r: 10 },
          { w: 37.5, r: 10 },
          { w: 37.5, r: 9 },
        ]),
        mockExercise("b-remo-mancuerna", "Remo con mancuerna", "Espalda", [
          { w: 14, r: 10 },
          { w: 14, r: 10 },
          { w: 14, r: 9 },
        ]),
        mockExercise("b-face-pull", "Face pull", "Hombro posterior", [
          { w: 17.5, r: 12 },
          { w: 17.5, r: 12 },
          { w: 17.5, r: 12 },
        ]),
        mockExercise(
          "b-curl-biceps",
          "Curl de bíceps",
          "Bíceps",
          [
            { w: 8, r: 10 },
            { w: 8, r: 9 },
            { w: 8, r: 8 },
          ],
          "Probar barra Z la próxima vez.",
        ),
      ],
    },
    48,
  ),
  finish(
    {
      id: "s-blanca-legs-1",
      personId: "blanca",
      routineId: "blanca-legs",
      routineName: "Legs",
      startedAt: daysAgo(6, 18, 20),
      exercises: [
        mockExercise("b-sentadilla", "Sentadilla", "Cuádriceps", [
          { w: 47.5, r: 8 },
          { w: 47.5, r: 8 },
          { w: 47.5, r: 7 },
          { w: 47.5, r: 6, done: false },
        ]),
        mockExercise("b-peso-muerto-rumano", "Peso muerto rumano", "Femoral", [
          { w: 50, r: 10 },
          { w: 50, r: 9 },
          { w: 50, r: 9 },
        ]),
        mockExercise("b-zancadas", "Zancadas", "Glúteo", [
          { w: 10, r: 12 },
          { w: 10, r: 12 },
          { w: 10, r: 10 },
        ]),
        mockExercise("b-gemelo", "Elevación de gemelo", "Gemelo", [
          { w: 30, r: 15 },
          { w: 30, r: 15 },
          { w: 30, r: 12 },
          { w: 30, r: 12 },
        ]),
      ],
    },
    57,
  ),
  finish(
    {
      id: "s-blanca-push-0",
      personId: "blanca",
      routineId: "blanca-push",
      routineName: "Push",
      startedAt: daysAgo(9, 18, 15),
      exercises: [
        mockExercise("b-press-banca", "Press banca", "Pecho", [
          { w: 37.5, r: 10 },
          { w: 37.5, r: 10 },
          { w: 37.5, r: 9 },
        ]),
        mockExercise("b-press-militar", "Press militar mancuernas", "Hombro", [
          { w: 10, r: 9 },
          { w: 10, r: 8 },
          { w: 10, r: 8 },
        ]),
        mockExercise("b-fondos", "Fondos asistidos", "Tríceps", [
          { w: 30, r: 10 },
          { w: 30, r: 9 },
          { w: 30, r: 8 },
        ]),
        mockExercise("b-elev-laterales", "Elevaciones laterales", "Hombro", [
          { w: 5, r: 12 },
          { w: 5, r: 12 },
          { w: 5, r: 12 },
          { w: 5, r: 11 },
        ]),
      ],
    },
    50,
  ),
  // ---------- Taras ----------
  finish(
    {
      id: "s-taras-upper-1",
      personId: "taras",
      routineId: "taras-upper",
      routineName: "Upper",
      startedAt: daysAgo(1, 20, 0),
      achievements: ["Mejor marca en Press banca: 82,5 kg"],
      exercises: [
        mockExercise(
          "t-press-banca",
          "Press banca",
          "Pecho",
          [
            { w: 82.5, r: 6 },
            { w: 82.5, r: 5 },
            { w: 80, r: 6 },
            { w: 80, r: 5 },
          ],
          "Récord personal. Pausa en el pecho en las dos primeras.",
        ),
        mockExercise("t-dominadas", "Dominadas lastradas", "Espalda", [
          { w: 10, r: 8 },
          { w: 10, r: 7 },
          { w: 10, r: 6 },
          { w: 5, r: 8 },
        ]),
        mockExercise("t-press-militar", "Press militar", "Hombro", [
          { w: 45, r: 8 },
          { w: 45, r: 7 },
          { w: 45, r: 6, done: false },
        ]),
        mockExercise("t-remo-barra", "Remo con barra", "Espalda", [
          { w: 70, r: 10 },
          { w: 70, r: 9 },
          { w: 70, r: 8 },
        ]),
      ],
    },
    64,
  ),
  finish(
    {
      id: "s-taras-lower-1",
      personId: "taras",
      routineId: "taras-lower",
      routineName: "Lower",
      startedAt: daysAgo(3, 19, 30),
      achievements: ["+5 kg en Peso muerto"],
      exercises: [
        mockExercise("t-sentadilla", "Sentadilla trasera", "Cuádriceps", [
          { w: 105, r: 8 },
          { w: 105, r: 7 },
          { w: 105, r: 6 },
          { w: 100, r: 8 },
        ]),
        mockExercise("t-peso-muerto", "Peso muerto", "Cadena posterior", [
          { w: 140, r: 5 },
          { w: 140, r: 5 },
          { w: 140, r: 4 },
        ]),
        mockExercise("t-prensa", "Prensa inclinada", "Cuádriceps", [
          { w: 180, r: 10 },
          { w: 180, r: 10 },
          { w: 180, r: 9 },
        ]),
        mockExercise(
          "t-femoral-tumbado",
          "Curl femoral tumbado",
          "Femoral",
          [
            { w: 45, r: 10 },
            { w: 45, r: 9 },
            { w: 45, r: 8 },
          ],
          "Subir a 47,5 si llego a 3×10.",
        ),
      ],
    },
    71,
  ),
  finish(
    {
      id: "s-taras-upper-0",
      personId: "taras",
      routineId: "taras-upper",
      routineName: "Upper",
      startedAt: daysAgo(8, 20, 10),
      exercises: [
        mockExercise("t-press-banca", "Press banca", "Pecho", [
          { w: 80, r: 6 },
          { w: 80, r: 6 },
          { w: 80, r: 5 },
          { w: 77.5, r: 6 },
        ]),
        mockExercise("t-dominadas", "Dominadas lastradas", "Espalda", [
          { w: 10, r: 7 },
          { w: 10, r: 6 },
          { w: 10, r: 6 },
          { w: 5, r: 8 },
        ]),
        mockExercise("t-press-militar", "Press militar", "Hombro", [
          { w: 42.5, r: 8 },
          { w: 42.5, r: 8 },
          { w: 42.5, r: 7 },
        ]),
        mockExercise("t-remo-barra", "Remo con barra", "Espalda", [
          { w: 67.5, r: 10 },
          { w: 67.5, r: 10 },
          { w: 67.5, r: 9 },
        ]),
      ],
    },
    62,
  ),
];

export const PERSON_IDS: PersonId[] = ["blanca", "taras"];
