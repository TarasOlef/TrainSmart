"use client";

import type { SessionExercise } from "@/lib/types";
import { cx } from "@/lib/utils";

/**
 * El listón: una muesca por serie de toda la sesión, agrupada por ejercicio.
 * Las muescas se llenan de tiza al registrar cada serie y la ámbar señala
 * la siguiente. De un vistazo se ve dónde estás y cuánto queda.
 */
export function SetRack({
  exercises,
  marker = false,
  className,
}: {
  exercises: SessionExercise[];
  /** Marca en ámbar la primera serie pendiente. */
  marker?: boolean;
  className?: string;
}) {
  let markerUsed = false;

  return (
    <div className={cx("flex items-stretch gap-2", className)} aria-hidden>
      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          className="flex min-w-0 gap-[3px]"
          style={{ flex: Math.max(1, exercise.sets.length) }}
        >
          {exercise.sets.map((set) => {
            const current = !set.completed && marker && !markerUsed;
            if (current) markerUsed = true;
            return (
              <span
                key={set.id}
                className={cx(
                  "h-full flex-1 rounded-full transition-colors duration-300",
                  set.completed
                    ? "bg-ink"
                    : current
                      ? "animate-pulse-soft bg-accent"
                      : "bg-line",
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
