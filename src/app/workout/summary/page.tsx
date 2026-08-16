"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { findLastSessionForRoutineSync, saveSession } from "@/lib/data";
import { PEOPLE } from "@/lib/mock-data";
import { useWorkout } from "@/lib/workout-store";
import { formatDuration } from "@/lib/utils";

export default function SummaryPage() {
  const router = useRouter();
  const toast = useToast();
  const { finished, hydrated, dispatch } = useWorkout();
  const [saving, setSaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    if (hydrated && !finished) router.replace("/");
  }, [hydrated, finished, router]);

  // Comparación con la sesión anterior de la misma rutina (antes de guardar esta)
  const previous = useMemo(() => {
    if (!finished || !finished.routineId) return null;
    return findLastSessionForRoutineSync(finished.personId, finished.routineId);
  }, [finished]);

  if (!finished) return null;

  const person = PEOPLE.find((p) => p.id === finished.personId);
  const totalSets = finished.exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completed).length,
    0,
  );
  const doneExercises = finished.exercises.filter((e) =>
    e.sets.some((s) => s.completed),
  ).length;
  const prevSets = previous?.exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completed).length,
    0,
  );

  const save = async () => {
    setSaving(true);
    try {
      await saveSession(finished);
      dispatch({ type: "CLEAR_FINISHED" });
      toast("Entrenamiento guardado");
      router.replace("/");
    } catch {
      setSaving(false);
      toast("No se pudo guardar. Inténtalo de nuevo.", "error");
    }
  };

  return (
    <main className="flex min-h-dvh flex-col px-5 pt-safe">
      <div className="flex flex-1 flex-col items-center pt-16 text-center">
        <CircleCheck className="size-16 animate-check-in text-lime" strokeWidth={1.5} />
        <h1 className="mt-5 text-[26px] font-bold tracking-tight">
          Entrenamiento completado
        </h1>
        <p className="mt-1 text-[15px] text-dim">
          {finished.routineName} · {person?.name}
        </p>

        {/* Cifras clave */}
        <div className="mt-8 grid w-full grid-cols-3 gap-2.5">
          <Stat value={formatDuration(finished.durationMin)} label="Duración" />
          <Stat value={String(doneExercises)} label="Ejercicios" />
          <Stat value={String(totalSets)} label="Series" />
        </div>

        {previous && (
          <p className="mt-3 text-[13px] text-faint">
            Sesión anterior: {formatDuration(previous.durationMin)} · {prevSets} series
          </p>
        )}

        {/* Logros */}
        {finished.achievements && finished.achievements.length > 0 && (
          <div className="mt-7 w-full">
            <div className="flex flex-col gap-2">
              {finished.achievements.map((a) => (
                <div
                  key={a}
                  className="flex animate-rise items-center gap-3 rounded-2xl border border-lime/25 bg-lime/8 px-4 py-3 text-left"
                >
                  <Trophy className="size-4.5 shrink-0 text-lime" strokeWidth={2} />
                  <span className="text-[15px] font-medium">{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 pb-safe-8 pt-8">
        <Button size="lg" variant="primary" onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="size-5 animate-spin" /> Guardando…
            </>
          ) : (
            "Guardar entrenamiento"
          )}
        </Button>
        <Button size="lg" variant="ghost" onClick={() => setConfirmLeave(true)} disabled={saving}>
          Volver al inicio
        </Button>
      </div>

      <ConfirmDialog
        open={confirmLeave}
        title="¿Salir sin guardar?"
        message="Este entrenamiento se descartará y no aparecerá en el historial."
        confirmLabel="Descartar entrenamiento"
        destructive
        onConfirm={() => {
          dispatch({ type: "CLEAR_FINISHED" });
          router.replace("/");
        }}
        onCancel={() => setConfirmLeave(false)}
      />
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-card border border-line bg-surface px-3 py-4">
      <p className="tnum text-2xl font-bold leading-tight">{value}</p>
      <p className="mt-1 text-xs text-faint">{label}</p>
    </div>
  );
}
