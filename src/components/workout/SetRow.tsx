"use client";

import { Check } from "lucide-react";
import type { ExerciseSet } from "@/lib/types";
import { cx, formatKg } from "@/lib/utils";
import { NumberField } from "./NumberField";

export const SET_GRID = "grid grid-cols-[1.5rem_2.9rem_minmax(0,1.15fr)_minmax(0,1fr)_2.5rem] items-center gap-x-2";

/** Una fila de la tabla de series: nº · anterior · kg · reps · hecho. */
export function SetRow({
  set,
  index,
  onPatch,
  onToggle,
  onRequestDelete,
}: {
  set: ExerciseSet;
  index: number;
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
        "rounded-xl px-1 py-1 transition-colors duration-200",
        set.completed && "bg-lime/8",
      )}
    >
      <button
        type="button"
        onClick={onRequestDelete}
        aria-label={`Opciones de la serie ${index + 1}`}
        className={cx(
          "tnum h-11 text-sm font-semibold",
          set.completed ? "text-lime" : "text-faint",
        )}
      >
        {index + 1}
      </button>

      <span className="tnum truncate text-[13px] text-faint" aria-label="Sesión anterior">
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
          "mx-auto flex size-10 items-center justify-center rounded-full border transition-colors duration-150",
          set.completed
            ? "animate-pop border-lime bg-lime text-bg"
            : "border-line bg-raised text-faint active:border-faint",
        )}
      >
        <Check className="size-5" strokeWidth={3} />
      </button>
    </div>
  );
}
