"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cx, formatKg, parseDecimal } from "@/lib/utils";
import { vibrate } from "@/lib/haptics";

/** Como el stepper de iOS: al mantener pulsado, la cifra empieza a correr. */
const HOLD_DELAY = 420;
const HOLD_INTERVAL = 90;

/**
 * Campo numérico táctil. Acepta decimales con coma ("62,5") y muestra el
 * valor de la sesión anterior como placeholder fantasma.
 *
 * El cuerpo se adapta a la longitud del número para que un "142,5" quepa
 * entero incluso en pantallas de 360 px: nunca se recorta una cifra.
 */
export function NumberField({
  value,
  placeholder,
  step,
  onChange,
  label,
  disabled = false,
  steppers = true,
}: {
  value: number | null;
  placeholder: number | null;
  step: number;
  onChange: (value: number | null) => void;
  label: string;
  disabled?: boolean;
  /** Botones de − / +. Se usan en el peso; las reps se teclean. */
  steppers?: boolean;
}) {
  const [text, setText] = useState(value === null ? "" : formatKg(value));

  // Referencias vivas para que el pulsado sostenido no trabaje con datos viejos
  const valueRef = useRef(value);
  const placeholderRef = useRef(placeholder);
  const changeRef = useRef(onChange);
  valueRef.current = value;
  placeholderRef.current = placeholder;
  changeRef.current = onChange;

  const hold = useRef<{ delay?: number; repeat?: number }>({});

  // Sincronizar cuando el valor cambia desde fuera (copiar anterior, autocompletar)
  useEffect(() => {
    const parsed = parseDecimal(text);
    if (parsed !== value) setText(value === null ? "" : formatKg(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const bump = useCallback(
    (dir: 1 | -1) => {
      const base = valueRef.current ?? placeholderRef.current ?? 0;
      const next = Math.max(0, Math.round((base + dir * step) * 100) / 100);
      vibrate(5);
      changeRef.current(next);
    },
    [step],
  );

  const stopHold = useCallback(() => {
    window.clearTimeout(hold.current.delay);
    window.clearInterval(hold.current.repeat);
    hold.current = {};
  }, []);

  const startHold = useCallback(
    (dir: 1 | -1) => {
      bump(dir);
      hold.current.delay = window.setTimeout(() => {
        hold.current.repeat = window.setInterval(() => bump(dir), HOLD_INTERVAL);
      }, HOLD_DELAY);
    },
    [bump],
  );

  useEffect(() => stopHold, [stopHold]);

  // Red de seguridad: cifras muy largas bajan de cuerpo antes que recortarse
  const shown = text || (placeholder === null ? "" : formatKg(placeholder));
  const size =
    shown.length >= 7 ? "text-[14px]" : shown.length === 6 ? "text-[16px]" : "text-[19px]";

  const stepper = (dir: 1 | -1) => (
    <button
      type="button"
      aria-label={`${dir === 1 ? "Subir" : "Bajar"} ${label}`}
      disabled={disabled}
      onPointerDown={(e) => {
        if (disabled) return;
        e.preventDefault();
        startHold(dir);
      }}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      className="flex h-full w-9 shrink-0 items-center justify-center text-faint transition-[color,transform] duration-100 active:scale-90 active:text-ink"
      tabIndex={-1}
    >
      {dir === 1 ? <Plus className="size-3.5" /> : <Minus className="size-3.5" />}
    </button>
  );

  return (
    <div
      className={cx(
        "flex h-12 items-center rounded-xl border bg-raised transition-colors duration-200",
        disabled ? "border-line/50 opacity-55" : "border-line",
      )}
    >
      {steppers && (
        <>
          {stepper(-1)}
          <span aria-hidden className="h-6 w-px bg-line/70" />
        </>
      )}
      <input
        type="text"
        inputMode="decimal"
        enterKeyHint="next"
        aria-label={label}
        disabled={disabled}
        value={text}
        placeholder={placeholder === null ? "–" : formatKg(placeholder)}
        onChange={(e) => {
          const raw = e.target.value;
          if (!/^[\d.,]*$/.test(raw)) return;
          setText(raw);
          onChange(parseDecimal(raw));
        }}
        onFocus={(e) => e.target.select()}
        className={cx(
          "tnum w-full min-w-0 bg-transparent px-0.5 text-center font-mono font-semibold text-ink transition-[font-size] duration-200 placeholder:font-normal placeholder:text-faint/50",
          size,
        )}
      />
      {steppers && (
        <>
          <span aria-hidden className="h-6 w-px bg-line/70" />
          {stepper(1)}
        </>
      )}
    </div>
  );
}
