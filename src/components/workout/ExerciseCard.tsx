"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  CircleCheck,
  CopyCheck,
  Plus,
  StickyNote,
  TrendingUp,
} from "lucide-react";
import type { SessionExercise } from "@/lib/types";
import { cx, formatKg } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { useWorkout } from "@/lib/workout-store";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { SetRow, SET_GRID } from "./SetRow";

/** Resumen "Última vez: 60 kg · 10, 9, 8 reps" a partir de los datos previos. */
function lastTimeSummary(exercise: SessionExercise): string | null {
  const prev = exercise.sets.filter((s) => s.prevWeightKg !== null && s.prevReps !== null);
  if (prev.length === 0) return null;
  const weight = Math.max(...prev.map((s) => s.prevWeightKg as number));
  const reps = prev.map((s) => s.prevReps).join(", ");
  return `Última vez: ${formatKg(weight)} kg · ${reps} reps`;
}

export function ExerciseCard({
  exercise,
  index,
  expanded,
  onToggleExpand,
  onSetCompleted,
  onExerciseCompleted,
}: {
  exercise: SessionExercise;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  /** Se llama cuando una serie pasa a completada (para lanzar el descanso). */
  onSetCompleted: () => void;
  onExerciseCompleted: () => void;
}) {
  const { dispatch } = useWorkout();
  const [deleteSetId, setDeleteSetId] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(exercise.note.length > 0);

  const doneSets = exercise.sets.filter((s) => s.completed).length;
  const status: "done" | "active" | "pending" = exercise.completed
    ? "done"
    : doneSets > 0
      ? "active"
      : "pending";

  const summary = lastTimeSummary(exercise);
  const hasPrev = exercise.sets.some((s) => s.prevWeightKg !== null);
  const deleteIndex = exercise.sets.findIndex((s) => s.id === deleteSetId);

  return (
    <section
      className={cx(
        "overflow-hidden rounded-card border bg-surface transition-colors duration-200",
        expanded ? "border-line" : "border-line/60",
        status === "done" && !expanded && "opacity-60",
      )}
    >
      {/* Cabecera del ejercicio */}
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={expanded}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <span
          className={cx(
            "tnum mt-0.5 text-[13px] font-semibold",
            status === "done" ? "text-lime" : "text-faint",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="truncate text-[17px] font-semibold leading-snug">
              {exercise.name}
            </span>
            {exercise.muscleGroup && (
              <span className="shrink-0 text-xs text-faint">{exercise.muscleGroup}</span>
            )}
          </span>
          <span className="mt-1 block text-[13px] text-dim">
            {summary ?? "Sin registros anteriores"}
          </span>
          {exercise.suggestion && !exercise.completed && (
            <span className="mt-1 flex items-center gap-1.5 text-[13px] text-lime/80">
              <TrendingUp className="size-3.5 shrink-0" strokeWidth={2} />
              {exercise.suggestion}
            </span>
          )}
        </span>

        <span className="mt-0.5 flex shrink-0 items-center gap-2">
          {status === "done" ? (
            <CircleCheck className="size-6 animate-check-in text-lime" strokeWidth={2} />
          ) : (
            <span
              className={cx(
                "tnum text-[13px]",
                status === "active" ? "text-ink" : "text-faint",
              )}
            >
              {doneSets}/{exercise.sets.length}
            </span>
          )}
          <ChevronDown
            className={cx(
              "size-4 text-faint transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </span>
      </button>

      {/* Registro de series */}
      {expanded && (
        <div className="animate-fade px-3 pb-4">
          <div className={cx(SET_GRID, "px-1 pb-1.5")}>
            <span className="text-center text-[11px] font-medium uppercase tracking-wide text-faint">
              Nº
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-faint">
              Ant.
            </span>
            <span className="text-center text-[11px] font-medium uppercase tracking-wide text-faint">
              Kg
            </span>
            <span className="text-center text-[11px] font-medium uppercase tracking-wide text-faint">
              Reps
            </span>
            <span aria-hidden />
          </div>

          <div className="flex flex-col gap-1.5">
            {exercise.sets.map((set, i) => (
              <SetRow
                key={set.id}
                set={set}
                index={i}
                onPatch={(patch) =>
                  dispatch({ type: "UPDATE_SET", exerciseId: exercise.id, setId: set.id, patch })
                }
                onToggle={() => {
                  const willComplete = !set.completed;
                  dispatch({ type: "TOGGLE_SET", exerciseId: exercise.id, setId: set.id });
                  if (willComplete) {
                    haptics.tick();
                    onSetCompleted();
                  }
                }}
                onRequestDelete={() => setDeleteSetId(set.id)}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              variant="surface"
              className="flex-1"
              onClick={() => dispatch({ type: "ADD_SET", exerciseId: exercise.id })}
            >
              <Plus className="size-4" /> Añadir serie
            </Button>
            {hasPrev && (
              <Button
                size="sm"
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  exercise.sets.forEach((s) => {
                    if (s.prevWeightKg !== null || s.prevReps !== null) {
                      dispatch({
                        type: "UPDATE_SET",
                        exerciseId: exercise.id,
                        setId: s.id,
                        patch: {
                          weightKg: s.weightKg ?? s.prevWeightKg,
                          reps: s.reps ?? s.prevReps,
                        },
                      });
                    }
                  });
                }}
              >
                <CopyCheck className="size-4" /> Copiar anterior
              </Button>
            )}
          </div>

          {/* Nota opcional, colapsada por defecto */}
          {noteOpen ? (
            <textarea
              value={exercise.note}
              onChange={(e) =>
                dispatch({ type: "SET_NOTE", exerciseId: exercise.id, note: e.target.value })
              }
              placeholder="Nota del ejercicio…"
              rows={2}
              className="mt-3 w-full resize-none rounded-xl border border-line bg-raised px-3.5 py-2.5 text-[15px] text-ink placeholder:text-faint"
            />
          ) : (
            <button
              type="button"
              onClick={() => setNoteOpen(true)}
              className="mt-3 flex items-center gap-1.5 px-1 text-[13px] text-faint active:text-dim"
            >
              <StickyNote className="size-3.5" /> Añadir nota
            </button>
          )}

          <Button
            size="lg"
            variant={exercise.completed ? "surface" : "primary"}
            className="mt-4 w-full"
            onClick={() => {
              dispatch({ type: "COMPLETE_EXERCISE", exerciseId: exercise.id });
              if (!exercise.completed) {
                haptics.success();
                onExerciseCompleted();
              }
            }}
          >
            {exercise.completed ? (
              "Reabrir ejercicio"
            ) : (
              <>
                <Check className="size-5" strokeWidth={2.5} /> Completar ejercicio
              </>
            )}
          </Button>
        </div>
      )}

      {/* Menú seguro para eliminar una serie */}
      <Sheet open={deleteSetId !== null} onClose={() => setDeleteSetId(null)}>
        <div className="pt-1">
          <h2 className="text-lg font-semibold">
            Serie {deleteIndex + 1} de {exercise.name}
          </h2>
          <div className="mt-5 flex flex-col gap-2.5">
            <Button
              size="lg"
              variant="danger"
              disabled={exercise.sets.length <= 1}
              onClick={() => {
                if (deleteSetId) {
                  dispatch({ type: "REMOVE_SET", exerciseId: exercise.id, setId: deleteSetId });
                  haptics.warn();
                }
                setDeleteSetId(null);
              }}
            >
              Eliminar serie
            </Button>
            <Button size="lg" variant="ghost" onClick={() => setDeleteSetId(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Sheet>
    </section>
  );
}
