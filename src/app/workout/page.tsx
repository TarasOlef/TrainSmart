"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, EllipsisVertical, Flag, Plus } from "lucide-react";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { RestTimer } from "@/components/workout/RestTimer";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { createAdHocExercise } from "@/lib/data";
import { PEOPLE } from "@/lib/mock-data";
import { sessionProgress, usePendingWork, useWorkout } from "@/lib/workout-store";
import { formatClock } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

export default function WorkoutPage() {
  const router = useRouter();
  const { session, finished, hydrated, dispatch } = useWorkout();
  const pending = usePendingWork(session);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [restSignal, setRestSignal] = useState(0);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const autoExpanded = useRef(false);

  // Sin sesión: volver al inicio (salvo que acabemos de finalizar)
  useEffect(() => {
    if (hydrated && !session && !finished) router.replace("/");
  }, [hydrated, session, finished, router]);

  // Cronómetro de sesión
  useEffect(() => {
    if (!session) return;
    const started = new Date(session.startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - started) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session?.startedAt, session]);

  // Expandir automáticamente el primer ejercicio pendiente al entrar
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
  const progress = sessionProgress(session);
  const doneExercises = session.exercises.filter((e) => e.completed).length;

  const finish = () => {
    dispatch({ type: "FINISH" });
    haptics.success();
    router.replace("/workout/summary");
  };

  return (
    <main className="pb-44">
      {/* Cabecera propia del entrenamiento (sin navegación general) */}
      <header className="sticky top-0 z-30 bg-bg/90 pt-safe backdrop-blur-lg">
        <div className="flex h-14 items-center gap-1 px-2">
          <button
            onClick={() => setLeaveOpen(true)}
            aria-label="Salir del entrenamiento"
            className="flex size-11 items-center justify-center rounded-full text-dim active:text-ink"
          >
            <ChevronLeft className="size-6" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[17px] font-semibold leading-tight">
              {session.routineName}
            </h1>
            <p className="text-xs leading-tight text-faint">
              {person?.name} · {doneExercises}/{session.exercises.length} ejercicios
            </p>
          </div>
          <span className="tnum px-1 text-[17px] font-semibold text-lime" aria-label="Tiempo transcurrido">
            {formatClock(elapsed)}
          </span>
          <button
            onClick={() => setLeaveOpen(true)}
            aria-label="Opciones del entrenamiento"
            className="flex size-11 items-center justify-center rounded-full text-dim active:text-ink"
          >
            <EllipsisVertical className="size-5" />
          </button>
        </div>
        {/* Progreso por series completadas */}
        <div className="h-0.5 bg-line/60" aria-hidden>
          <div
            className="h-full bg-lime transition-[width] duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </header>

      {/* Ejercicios */}
      <div className="flex flex-col gap-3 px-4 pt-4">
        {session.exercises.length === 0 && (
          <div className="px-4 py-14 text-center">
            <p className="text-[17px] font-semibold">Entrenamiento libre</p>
            <p className="mx-auto mt-1.5 max-w-60 text-sm leading-relaxed text-dim">
              Añade el primer ejercicio y empieza a registrar tus series.
            </p>
          </div>
        )}
        {session.exercises.map((exercise, i) => (
          <div key={exercise.id} id={`exercise-${exercise.id}`} className="scroll-mt-20">
            <ExerciseCard
              exercise={exercise}
              index={i}
              expanded={expandedId === exercise.id}
              onToggleExpand={() =>
                setExpandedId((cur) => (cur === exercise.id ? null : exercise.id))
              }
              onSetCompleted={() => setRestSignal((n) => n + 1)}
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
              ? "mx-auto -mt-8 flex h-12 items-center gap-2 rounded-2xl border border-line bg-surface px-6 text-[15px] font-medium text-ink active:bg-raised"
              : "mx-auto mt-1 flex items-center gap-1.5 px-4 py-3 text-sm text-faint active:text-dim"
          }
        >
          <Plus className="size-4" /> Añadir ejercicio
        </button>
      </div>

      {/* Zona fija inferior: descanso + finalizar */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-4 pb-safe-4">
        <div className="flex flex-col gap-2.5">
          <RestTimer startSignal={restSignal} onDismiss={() => setRestSignal(0)} />
          <Button
            size="lg"
            variant="primary"
            className="w-full shadow-lg shadow-black/40"
            onClick={() => (pending ? setFinishOpen(true) : finish())}
          >
            <Flag className="size-5" /> Finalizar entrenamiento
          </Button>
        </div>
      </div>

      {/* Salir / descartar */}
      <Sheet open={leaveOpen} onClose={() => setLeaveOpen(false)}>
        <div className="pt-1">
          <h2 className="text-lg font-semibold">¿Salir del entrenamiento?</h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-dim">
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
            className="w-full rounded-xl border border-line bg-raised px-4 py-3.5 text-base text-ink placeholder:text-faint"
          />
          <Button type="submit" size="lg" variant="primary" className="mt-4 w-full" disabled={!newName.trim()}>
            Añadir
          </Button>
        </form>
      </Sheet>
    </main>
  );
}
