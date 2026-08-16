"use client";

import { Check } from "lucide-react";
import type { ExerciseSet } from "@/lib/types";
import { cx, formatKg } from "@/lib/utils";
import { NumberField } from "./NumberField";

export const SET_GRID =
  "grid grid-cols-[1.75rem_3rem_minmax(0,1.15fr)_minmax(0,1fr)_3rem] items-center gap-x-2";

/** Una fila del registro: nº · anterior · kg · reps · hecho. */
export function SetRow({
  set,
  index,
  current,
  onPatch,
  onToggle,
  onRequestDelete,
}: {
  set: ExerciseSet;
  index: number;
  /** Primera serie pendiente del ejercicio: es donde estás ahora. */
  current: boolean;
  onPatch: (patch: Partial<ExerciseSet>) => void;
  onToggle: () => void;
  onRequestDelete: () => void;
}) {
  const prev =
    set.prevWeightKg !== null && set.prevReps !== null
      ? `${formatKg(set.prevWeightKg)}×${set.prevReps}`
      : "–";

  return (
    <div
      className={cx(
        SET_GRID,
        "relative rounded-xl py-1 pl-1 pr-1 transition-colors duration-200",
        set.completed && "bg-ink/5",
      )}
    >
      {current && (
        <span
          aria-hidden
          className="absolute inset-y-2 -left-1.5 w-[3px] rounded-full bg-accent"
        />
      )}

      <button
        type="button"
        onClick={onRequestDelete}
        aria-label={`Opciones de la serie ${index + 1}`}
        className={cx(
          "tnum h-11 font-mono text-[13px] font-medium transition-colors",
          set.completed ? "text-ink" : current ? "text-accent" : "text-faint",
        )}
      >
        {index + 1}
      </button>

      <span
        className="tnum truncate font-mono text-[12px] text-faint"
        aria-label="Sesión anterior"
      >
        {prev}
      </span>

      <NumberField
        label={`Peso de la serie ${index + 1} en kilos`}
        value={set.weightKg}
        placeholder={set.prevWeightKg}
        step={2.5}
        onChange={(weightKg) => onPatch({ weightKg })}
        disabled={set.completed}
      />

      <NumberField
        label={`Repeticiones de la serie ${index + 1}`}
        value={set.reps}
        placeholder={set.prevReps}
        step={1}
        onChange={(reps) => onPatch({ reps: reps === null ? null : Math.round(reps) })}
        disabled={set.completed}
      />

      <button
        type="button"
        onClick={onToggle}
        aria-label={
          set.completed
            ? `Desmarcar serie ${index + 1}`
            : `Marcar serie ${index + 1} como completada`
        }
        aria-pressed={set.completed}
        className={cx(
          "mx-auto flex size-11 items-center justify-center rounded-full border transition-all duration-150 active:scale-90",
          set.completed
            ? "animate-pop border-ink bg-ink text-bg"
            : current
              ? "border-accent/70 bg-accent/10 text-accent"
              : "border-line bg-raised text-faint",
        )}
      >
        <Check className="size-5" strokeWidth={3} />
      </button>
    </div>
  );
}
