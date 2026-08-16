"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
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
import { SetRack } from "./SetRack";
import { SetRow, SET_GRID } from "./SetRow";

/** Resumen "60 kg · 10, 9, 8" a partir de los datos de la sesión anterior. */
function lastTimeSummary(exercise: SessionExercise): string | null {
  const prev = exercise.sets.filter((s) => s.prevWeightKg !== null && s.prevReps !== null);
  if (prev.length === 0) return null;
  const weight = Math.max(...prev.map((s) => s.prevWeightKg as number));
  const reps = prev.map((s) => s.prevReps).join(", ");
  return `${formatKg(weight)} kg · ${reps}`;
}

export function ExerciseCard({
  exercise,
  index,
  expanded,
  onToggleExpand,
  onExerciseCompleted,
}: {
  exercise: SessionExercise;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onExerciseCompleted: () => void;
}) {
  const { dispatch } = useWorkout();
  const [deleteSetId, setDeleteSetId] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(exercise.note.length > 0);

  const doneSets = exercise.sets.filter((s) => s.completed).length;
  const done = exercise.completed;
  const active = expanded && !done;

  const summary = lastTimeSummary(exercise);
  const hasPrev = exercise.sets.some((s) => s.prevWeightKg !== null);
  const deleteIndex = exercise.sets.findIndex((s) => s.id === deleteSetId);
  const currentSetId = exercise.sets.find((s) => !s.completed)?.id ?? null;

  return (
    <section
      className={cx(
        "relative overflow-hidden rounded-card border transition-all duration-300",
        expanded
          ? "border-line bg-surface shadow-[0_28px_60px_-40px_rgba(0,0,0,1)]"
          : "border-line/60 bg-surface/55",
        done && !expanded && "opacity-55",
      )}
    >
      {/* El acento marca dónde estás */}
      {active && (
        <span
          aria-hidden
          className="absolute inset-y-5 left-0 w-[3px] rounded-r-full bg-accent"
        />
      )}

      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={expanded}
        className="flex w-full items-start gap-3.5 p-4 text-left"
      >
        <span
          className={cx(
            "tnum mt-1 font-mono text-[12px] font-medium",
            done ? "text-ink" : active ? "text-accent" : "text-faint",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="min-w-0 flex-1">
          {/* El nombre manda: fluye en dos líneas antes que recortarse */}
          <span className="block font-display text-[18px] font-bold leading-snug tracking-tight">
            {exercise.name}
            {exercise.muscleGroup && (
              <span className="eyebrow ml-2 inline-block whitespace-nowrap rounded-full border border-line px-2 py-0.5 align-middle text-faint">
                {exercise.muscleGroup}
              </span>
            )}
          </span>
          <span className="mt-1 block font-mono text-[11.5px] text-dim">
            {summary ? `Anterior · ${summary}` : "Sin registros anteriores"}
          </span>
          {exercise.suggestion && !done && (
            <span className="mt-1.5 flex items-center gap-1.5 text-[13px] text-dim">
              <TrendingUp className="size-3.5 shrink-0 text-accent/80" strokeWidth={2.25} />
              {exercise.suggestion}
            </span>
          )}
        </span>

        <span className="mt-0.5 flex shrink-0 items-center gap-2.5">
          {done ? (
            <Check className="size-5 animate-check-in text-ink" strokeWidth={3} />
          ) : (
            <span className="tnum font-mono text-[13px] text-dim">
              {doneSets}
              <span className="text-faint">/{exercise.sets.length}</span>
            </span>
          )}
          <ChevronDown
            className={cx(
              "size-4 text-faint transition-transform duration-300",
              expanded && "rotate-180",
            )}
          />
        </span>
      </button>

      {/* Muescas del ejercicio cuando está plegado */}
      {!expanded && exercise.sets.length > 0 && (
        <div className="px-4 pb-4">
          <SetRack exercises={[exercise]} className="h-1" />
        </div>
      )}

      {expanded && (
        <div className="animate-fade px-4 pb-4">
          <div className={cx(SET_GRID, "px-1 pb-2")}>
            <span className="eyebrow text-center text-faint">Nº</span>
            <span className="eyebrow text-faint">Ant</span>
            <span className="eyebrow text-center text-faint">Kg</span>
            <span className="eyebrow text-center text-faint">Reps</span>
            <span aria-hidden />
          </div>

          <div className="flex flex-col gap-1.5">
            {exercise.sets.map((set, i) => (
              <SetRow
                key={set.id}
                set={set}
                index={i}
                current={set.id === currentSetId}
                onPatch={(patch) =>
                  dispatch({ type: "UPDATE_SET", exerciseId: exercise.id, setId: set.id, patch })
                }
                onToggle={() => {
                  const willComplete = !set.completed;
                  dispatch({ type: "TOGGLE_SET", exerciseId: exercise.id, setId: set.id });
                  if (willComplete) haptics.tick();
                }}
                onRequestDelete={() => setDeleteSetId(set.id)}
              />
            ))}
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <Button
              size="sm"
              variant="surface"
              className="flex-1"
              onClick={() => dispatch({ type: "ADD_SET", exerciseId: exercise.id })}
            >
              <Plus className="size-4" /> Serie
            </Button>
            {hasPrev && (
              <Button
                size="sm"
                variant="surface"
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

          {/* Nota opcional, plegada por defecto */}
          {noteOpen ? (
            <textarea
              value={exercise.note}
              onChange={(e) =>
                dispatch({ type: "SET_NOTE", exerciseId: exercise.id, note: e.target.value })
              }
              placeholder="Nota del ejercicio…"
              rows={2}
              className="mt-3 w-full resize-none rounded-xl border border-line bg-raised px-3.5 py-2.5 text-[15px] leading-relaxed text-ink placeholder:text-faint"
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
            variant={done ? "surface" : "primary"}
            className="mt-4 w-full"
            onClick={() => {
              dispatch({ type: "COMPLETE_EXERCISE", exerciseId: exercise.id });
              if (!done) {
                haptics.success();
                onExerciseCompleted();
              }
            }}
          >
            {done ? (
              "Reabrir ejercicio"
            ) : (
              <>
                <Check className="size-5" strokeWidth={2.75} /> Completar ejercicio
              </>
            )}
          </Button>
        </div>
      )}

      {/* Menú seguro para eliminar una serie */}
      <Sheet open={deleteSetId !== null} onClose={() => setDeleteSetId(null)}>
        <div className="pt-1">
          <h2 className="font-display text-xl font-bold tracking-tight">
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
