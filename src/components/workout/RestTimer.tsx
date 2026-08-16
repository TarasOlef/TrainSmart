"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Timer, X } from "lucide-react";
import { cx, formatClock } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

const CHOICES = [60, 90, 120, 180] as const;
const DEFAULT_REST = 90;

/**
 * Temporizador de descanso compacto. No bloquea la app: vive como una
 * tarjeta encima del botón de finalizar. Se reinicia con cada serie
 * completada (startSignal) y se cierra solo al terminar.
 */
export function RestTimer({
  startSignal,
  onDismiss,
}: {
  /** Incrementa con cada serie completada; 0 = oculto. */
  startSignal: number;
  onDismiss: () => void;
}) {
  const [total, setTotal] = useState(DEFAULT_REST);
  const [remaining, setRemaining] = useState(DEFAULT_REST);
  const endsAtRef = useRef(0);
  const firedRef = useRef(false);

  // Nueva serie completada: reiniciar cuenta atrás
  useEffect(() => {
    if (startSignal === 0) return;
    setTotal(DEFAULT_REST);
    setRemaining(DEFAULT_REST);
    endsAtRef.current = Date.now() + DEFAULT_REST * 1000;
    firedRef.current = false;
  }, [startSignal]);

  useEffect(() => {
    if (startSignal === 0) return;
    const tick = () => {
      const left = Math.ceil((endsAtRef.current - Date.now()) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true;
        haptics.timerDone();
        setTimeout(onDismiss, 1200);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [startSignal, onDismiss]);

  if (startSignal === 0) return null;

  const setDuration = (seconds: number) => {
    setTotal(seconds);
    setRemaining(seconds);
    endsAtRef.current = Date.now() + seconds * 1000;
    firedRef.current = false;
  };

  const addThirty = () => {
    endsAtRef.current += 30_000;
    setTotal((t) => t + 30);
    setRemaining(Math.ceil((endsAtRef.current - Date.now()) / 1000));
    firedRef.current = false;
  };

  const done = remaining === 0;
  const progress = total > 0 ? remaining / total : 0;

  return (
    <div
      role="timer"
      aria-label="Descanso"
      className="animate-rise rounded-2xl border border-line bg-raised p-3 shadow-lg shadow-black/40"
    >
      <div className="flex items-center gap-3">
        <Timer className={cx("size-5 shrink-0", done ? "text-lime" : "text-dim")} />
        <span
          className={cx(
            "tnum min-w-14 text-2xl font-semibold",
            done ? "animate-pop text-lime" : "text-ink",
          )}
        >
          {done ? "¡Va!" : formatClock(remaining)}
        </span>

        <div className="flex flex-1 justify-end gap-1">
          {CHOICES.map((c) => (
            <button
              key={c}
              onClick={() => setDuration(c)}
              className={cx(
                "tnum h-9 rounded-lg px-2 text-[13px] font-medium transition-colors",
                total === c && !done ? "bg-lime/15 text-lime" : "text-faint active:text-ink",
              )}
            >
              {c}
            </button>
          ))}
          <button
            onClick={addThirty}
            aria-label="Añadir 30 segundos"
            className="flex h-9 items-center gap-0.5 rounded-lg px-2 text-[13px] font-medium text-faint active:text-ink"
          >
            <Plus className="size-3.5" />30
          </button>
          <button
            onClick={onDismiss}
            aria-label="Omitir descanso"
            className="flex size-9 items-center justify-center rounded-lg text-faint active:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-line" aria-hidden>
        <div
          className={cx(
            "h-full rounded-full transition-[width] duration-300 ease-linear",
            done ? "bg-lime" : "bg-lime/70",
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
