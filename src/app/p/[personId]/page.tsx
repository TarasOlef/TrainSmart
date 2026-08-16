"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarPlus, Dumbbell, Play } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav, BottomNavSpacer } from "@/components/BottomNav";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  createSession,
  findLastSessionForRoutineSync,
  getRoutines,
} from "@/lib/data";
import { PEOPLE } from "@/lib/mock-data";
import type { PersonId, WorkoutRoutine } from "@/lib/types";
import { useWorkout } from "@/lib/workout-store";
import { cx, formatDuration, relativeDays } from "@/lib/utils";

export default function PersonPage() {
  const router = useRouter();
  const params = useParams<{ personId: string }>();
  const personId = (params.personId === "taras" ? "taras" : "blanca") as PersonId;
  const person = PEOPLE.find((p) => p.id === personId)!;

  const { session, dispatch, hydrated } = useWorkout();
  const [routines, setRoutines] = useState<WorkoutRoutine[] | null>(null);
  const [pendingStart, setPendingStart] = useState<WorkoutRoutine | null | "libre">(null);

  useEffect(() => {
    let cancelled = false;
    getRoutines(personId).then((r) => {
      if (!cancelled) setRoutines(r);
    });
    return () => {
      cancelled = true;
    };
  }, [personId]);

  const lastByRoutine = useMemo(() => {
    if (!routines || !hydrated) return {};
    return Object.fromEntries(
      routines.map((r) => [r.id, findLastSessionForRoutineSync(personId, r.id)]),
    );
  }, [routines, personId, hydrated]);

  /** La rutina que lleva más tiempo sin hacerse es la que toca hoy. */
  const suggestedId = useMemo(() => {
    if (!routines || routines.length === 0) return null;
    let best = routines[0]!;
    let bestTime = Number.POSITIVE_INFINITY;
    for (const routine of routines) {
      const last = lastByRoutine[routine.id];
      const time = last ? new Date(last.startedAt).getTime() : Number.NEGATIVE_INFINITY;
      if (time < bestTime) {
        bestTime = time;
        best = routine;
      }
    }
    return best.id;
  }, [routines, lastByRoutine]);

  const start = (routine: WorkoutRoutine | null) => {
    // Si hay otra sesión en marcha, pedir confirmación antes de sustituirla
    if (session) {
      setPendingStart(routine ?? "libre");
      return;
    }
    launch(routine);
  };

  const launch = (routine: WorkoutRoutine | null) => {
    dispatch({ type: "START", session: createSession(personId, routine) });
    router.push("/workout");
  };

  return (
    <main>
      <TopBar title={person.name} subtitle="Elige el día" onBack={() => router.push("/")} />

      <div className="px-4 pt-5">
        {routines === null ? (
          <div className="flex flex-col gap-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : routines.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title={`${person.name} aún no tiene rutinas`}
            message="Crea su primer día de entrenamiento para empezar a registrar pesos."
            action={
              <Link href="/rutinas">
                <Button variant="primary" size="md">
                  <CalendarPlus className="size-4" /> Crear rutina
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {routines.map((routine, i) => {
              const last = lastByRoutine[routine.id];
              const preview = routine.exercises.slice(0, 4).map((e) => e.name).join(" · ");
              const suggested = routine.id === suggestedId;
              return (
                <button
                  key={routine.id}
                  onClick={() => start(routine)}
                  className={cx(
                    "w-full animate-rise rounded-tile border bg-surface p-5 text-left transition-transform duration-200 active:scale-[0.985]",
                    suggested ? "border-accent/30" : "border-line",
                    i === 1 && "stagger-1",
                    i === 2 && "stagger-2",
                    i >= 3 && "stagger-3",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      {suggested && (
                        <p className="eyebrow mb-2 text-accent">Toca hoy</p>
                      )}
                      <h2 className="font-display text-[26px] font-extrabold leading-none tracking-tight">
                        {routine.name}
                      </h2>
                      <p className="mt-2.5 font-mono text-[11px] text-faint">
                        {routine.exercises.length} ejercicios
                        {last && (
                          <>
                            {" · "}
                            {relativeDays(last.startedAt)} · {formatDuration(last.durationMin)}
                          </>
                        )}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className={cx(
                        "flex size-12 shrink-0 items-center justify-center rounded-full",
                        suggested
                          ? "bg-accent text-bg shadow-[0_12px_28px_-14px] shadow-accent/80"
                          : "border border-line bg-raised text-dim",
                      )}
                    >
                      <Play className="size-5 fill-current" />
                    </span>
                  </div>

                  {preview && (
                    <p className="mt-4 truncate border-t border-line/70 pt-3 text-[13px] text-dim">
                      {preview}
                    </p>
                  )}
                </button>
              );
            })}

            {/* Opción secundaria, deliberadamente discreta */}
            <button
              onClick={() => start(null)}
              className="mx-auto mt-1 px-4 py-3 text-[13px] text-faint active:text-dim"
            >
              Entrenamiento libre
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingStart !== null}
        title="Ya hay un entrenamiento en curso"
        message="Si empiezas uno nuevo, el entrenamiento actual se descartará y no se guardará."
        confirmLabel="Descartar y empezar"
        destructive
        onConfirm={() => {
          const target = pendingStart === "libre" ? null : pendingStart;
          setPendingStart(null);
          launch(target);
        }}
        onCancel={() => setPendingStart(null)}
      />

      <BottomNavSpacer />
      <BottomNav />
    </main>
  );
}
