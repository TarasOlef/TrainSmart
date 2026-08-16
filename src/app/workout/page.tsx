"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Flag, Plus } from "lucide-react";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { SetRack } from "@/components/workout/SetRack";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { createAdHocExercise } from "@/lib/data";
import { PEOPLE } from "@/lib/mock-data";
import {
  sessionSets,
  sessionVolume,
  usePendingWork,
  useWorkout,
} from "@/lib/workout-store";
import { formatVolume } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

export default function WorkoutPage() {
  const router = useRouter();
  const { session, finished, hydrated, dispatch } = useWorkout();
  const pending = usePendingWork(session);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const autoExpanded = useRef(false);

  // Sin sesión: volver al inicio (salvo que acabemos de finalizar)
  useEffect(() => {
    if (hydrated && !session && !finished) router.replace("/");
  }, [hydrated, session, finished, router]);

  // Abrir el primer ejercicio pendiente al entrar
  useEffect(() => {
    if (!session || autoExpanded.current) return;
    autoExpanded.current = true;
    const first = session.exercises.find((e) => !e.completed);
    setExpandedId(first?.id ?? null);
  }, [session]);

  const advanceToNext = useCallback(
    (fromId: string) => {
      if (!session) return;
      const next = session.exercises.find((e) => e.id !== fromId && !e.completed);
      setExpandedId(next?.id ?? null);
      if (next) {
        setTimeout(() => {
          document
            .getElementById(`exercise-${next.id}`)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    },
    [session],
  );

  if (!session) return null;

  const person = PEOPLE.find((p) => p.id === session.personId);
  const doneExercises = session.exercises.filter((e) => e.completed).length;
  const sets = sessionSets(session);
  const volume = sessionVolume(session);

  const finish = () => {
    dispatch({ type: "FINISH" });
    haptics.success();
    router.replace("/workout/summary");
  };

  return (
    <main className="pb-56">
      {/* Cabecera del entrenamiento: sin navegación general, sin reloj */}
      <header className="sticky top-0 z-30 bg-bg/85 pt-safe backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4">
          <button
            onClick={() => setLeaveOpen(true)}
            aria-label="Salir del entrenamiento"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-dim active:text-ink"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-[19px] font-bold leading-tight tracking-tight">
              {session.routineName}
            </h1>
            <p className="truncate font-mono text-[11px] leading-tight text-faint">
              {person?.name} · {doneExercises} de {session.exercises.length} ejercicios
            </p>
          </div>
        </div>

        {/* El listón: una muesca por serie de toda la sesión */}
        <div className="px-4 pb-3">
          <SetRack exercises={session.exercises} marker className="h-1.5" />
        </div>
      </header>

      <div className="flex flex-col gap-2.5 px-4 pt-3">
        {session.exercises.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="font-display text-xl font-bold tracking-tight">
              Entrenamiento libre
            </p>
            <p className="mx-auto mt-2 max-w-60 text-[15px] leading-relaxed text-dim">
              Añade el primer ejercicio y empieza a registrar series.
            </p>
          </div>
        )}

        {session.exercises.map((exercise, i) => (
          <div key={exercise.id} id={`exercise-${exercise.id}`} className="scroll-mt-24">
            <ExerciseCard
              exercise={exercise}
              index={i}
              expanded={expandedId === exercise.id}
              onToggleExpand={() =>
                setExpandedId((cur) => (cur === exercise.id ? null : exercise.id))
              }
              onExerciseCompleted={() => advanceToNext(exercise.id)}
            />
          </div>
        ))}

        <button
          onClick={() => {
            setNewName("");
            setAddOpen(true);
          }}
          className={
            session.exercises.length === 0
              ? "mx-auto -mt-6 flex h-12 items-center gap-2 rounded-full border border-line bg-surface px-6 text-[15px] font-medium text-ink active:bg-raised"
              : "mx-auto mt-1 flex items-center gap-1.5 px-4 py-3 text-[13px] text-faint active:text-dim"
          }
        >
          <Plus className="size-4" /> Añadir ejercicio
        </button>
      </div>

      {/* Panel fijo: lo que llevas hecho y el cierre de la sesión */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-4 pb-safe-4">
        <div className="rounded-[1.75rem] border border-line/80 bg-surface/90 p-3 shadow-[0_28px_60px_-28px_rgba(0,0,0,1)] backdrop-blur-xl">
          <div className="flex items-end justify-between px-3 pb-3.5 pt-1.5">
            <Meter value={String(sets)} label="Series hechas" />
            <div className="h-8 w-px bg-line" aria-hidden />
            <Meter value={formatVolume(volume)} label="Kg movidos" />
          </div>
          {/* Mientras quede trabajo, finalizar es la salida, no la acción */}
          <Button
            size="lg"
            variant={pending ? "surface" : "primary"}
            className="w-full"
            onClick={() => (pending ? setFinishOpen(true) : finish())}
          >
            <Flag className="size-5" /> Finalizar entrenamiento
          </Button>
        </div>
      </div>

      {/* Salir / descartar */}
      <Sheet open={leaveOpen} onClose={() => setLeaveOpen(false)}>
        <div className="pt-1">
          <h2 className="font-display text-xl font-bold tracking-tight">
            ¿Salir del entrenamiento?
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-dim">
            El progreso queda guardado y podrás reanudarlo desde el inicio.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              size="lg"
              variant="surface"
              onClick={() => {
                setLeaveOpen(false);
                router.push("/");
              }}
            >
              Salir y mantener el progreso
            </Button>
            <Button
              size="lg"
              variant="danger"
              onClick={() => {
                dispatch({ type: "DISCARD" });
                haptics.warn();
                setLeaveOpen(false);
                router.replace("/");
              }}
            >
              Descartar entrenamiento
            </Button>
            <Button size="lg" variant="ghost" onClick={() => setLeaveOpen(false)}>
              Seguir entrenando
            </Button>
          </div>
        </div>
      </Sheet>

      {/* Confirmar finalización con trabajo pendiente */}
      <ConfirmDialog
        open={finishOpen}
        title="Quedan series sin completar"
        message="Puedes finalizar igualmente: solo se guardarán las series marcadas como completadas."
        confirmLabel="Finalizar igualmente"
        onConfirm={() => {
          setFinishOpen(false);
          finish();
        }}
        onCancel={() => setFinishOpen(false)}
      />

      {/* Añadir ejercicio (entrenamiento libre o extra) */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Añadir ejercicio">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const name = newName.trim();
            if (!name) return;
            const exercise = createAdHocExercise(session.personId, name);
            dispatch({ type: "ADD_EXERCISE", exercise });
            setAddOpen(false);
            setExpandedId(exercise.id);
          }}
        >
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre del ejercicio"
            className="w-full rounded-2xl border border-line bg-raised px-4 py-3.5 text-base text-ink placeholder:text-faint"
          />
          <Button
            type="submit"
            size="lg"
            variant="primary"
            className="mt-4 w-full"
            disabled={!newName.trim()}
          >
            Añadir
          </Button>
        </form>
      </Sheet>
    </main>
  );
}

/** Cifra viva de la sesión: qué llevas hecho, no cuánto tiempo llevas. */
function Meter({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="tnum font-mono text-[22px] font-semibold leading-none">{value}</p>
      <p className="eyebrow mt-1.5 text-faint">{label}</p>
    </div>
  );
}
