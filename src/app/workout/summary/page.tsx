"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { findLastSessionForRoutineSync, saveSession } from "@/lib/data";
import { PEOPLE } from "@/lib/mock-data";
import { sessionSets, sessionVolume, useWorkout } from "@/lib/workout-store";
import { formatDuration, formatVolume } from "@/lib/utils";

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
  const totalSets = sessionSets(finished);
  const volume = sessionVolume(finished);
  const doneExercises = finished.exercises.filter((e) =>
    e.sets.some((s) => s.completed),
  ).length;
  const prevVolume = previous ? sessionVolume(previous) : null;
  const delta = prevVolume !== null ? volume - prevVolume : null;

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
      <div className="flex flex-1 flex-col justify-center pt-10">
        <div className="flex animate-rise items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-ink text-bg">
            <Check className="size-4" strokeWidth={3.5} />
          </span>
          <span className="eyebrow text-dim">Entrenamiento completado</span>
        </div>

        {/* La cifra de la sesión: el trabajo movido */}
        <p className="mt-7 animate-rise stagger-1 font-display text-[68px] font-extrabold leading-[0.9] tracking-tighter">
          {formatVolume(volume)}
          <span className="ml-2 align-top font-mono text-xl font-medium text-faint">kg</span>
        </p>
        <p className="mt-3 animate-rise stagger-1 font-mono text-[12px] text-dim">
          {finished.routineName} · {person?.name}
        </p>

        {delta !== null && delta > 0 && (
          <p className="mt-4 flex animate-rise stagger-2 items-center gap-1.5 text-[13px] font-medium text-accent">
            <TrendingUp className="size-4" strokeWidth={2.25} />
            {formatVolume(delta)} kg más que la última vez
          </p>
        )}

        <div className="mt-9 grid animate-rise stagger-2 grid-cols-3 gap-2.5">
          <Stat value={formatDuration(finished.durationMin)} label="Duración" />
          <Stat value={String(doneExercises)} label="Ejercicios" />
          <Stat value={String(totalSets)} label="Series" />
        </div>

        {previous && (
          <p className="mt-3 font-mono text-[11px] text-faint">
            Anterior · {formatDuration(previous.durationMin)} ·{" "}
            {prevVolume !== null ? `${formatVolume(prevVolume)} kg` : "–"}
          </p>
        )}

        {finished.achievements && finished.achievements.length > 0 && (
          <div className="mt-8 flex flex-col gap-2">
            {finished.achievements.map((a, i) => (
              <div
                key={a}
                className="flex animate-rise stagger-3 items-center gap-3 rounded-2xl border border-accent/25 bg-accent/8 px-4 py-3.5 text-left"
                style={{ animationDelay: `${160 + i * 60}ms` }}
              >
                <Trophy className="size-4 shrink-0 text-accent" strokeWidth={2} />
                <span className="text-[15px] font-medium">{a}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5 pb-safe-8 pt-10">
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
    <div className="rounded-card border border-line bg-surface px-3.5 py-4">
      <p className="tnum font-mono text-[19px] font-semibold leading-none">{value}</p>
      <p className="eyebrow mt-2 text-faint">{label}</p>
    </div>
  );
}
