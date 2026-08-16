"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cifra que rueda hasta su nuevo valor en lugar de saltar. Se usa en los kg
 * movidos: al marcar una serie el número sube solo, y se nota el avance.
 */
export function CountUp({
  value,
  format = (n) => String(Math.round(n)),
  duration = 620,
  startFrom,
}: {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  /** Cifra de arranque: con 0, la cuenta también corre al aparecer. */
  startFrom?: number;
}) {
  const [shown, setShown] = useState(startFrom ?? value);
  const from = useRef(startFrom ?? value);
  const frame = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || from.current === value) {
      from.current = value;
      setShown(value);
      return;
    }
    const startValue = from.current;
    const delta = value - startValue;
    const startTime = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      // Desaceleración suave, sin rebote: la cifra tiene que ser legible
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(startValue + delta * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else from.current = value;
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  return <>{format(shown)}</>;
}
