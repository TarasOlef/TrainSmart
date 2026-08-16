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
import { formatDuration, relativeDays } from "@/lib/utils";

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
      <TopBar title={person.name} subtitle="Elige tu entrenamiento" onBack={() => router.push("/")} />

      <div className="px-5 pt-4">
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
            {routines.map((routine) => {
              const last = lastByRoutine[routine.id];
              return (
                <div
                  key={routine.id}
                  className="flex items-center gap-3 rounded-card border border-line bg-surface p-5"
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold leading-tight">{routine.name}</h2>
                    <p className="mt-1 text-[13px] text-dim">
                      {routine.exercises.length} ejercicios
                      {last && (
                        <>
                          {" · "}Último: {relativeDays(last.startedAt)} ·{" "}
                          {formatDuration(last.durationMin)}
                        </>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    className="shrink-0 rounded-full"
                    onClick={() => start(routine)}
                  >
                    <Play className="size-4 fill-current" /> Empezar
                  </Button>
                </div>
              );
            })}

            {/* Opción secundaria, deliberadamente discreta */}
            <button
              onClick={() => start(null)}
              className="mx-auto mt-2 px-4 py-3 text-sm text-faint underline-offset-4 active:text-dim"
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
