"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cx, formatKg, parseDecimal } from "@/lib/utils";
import { vibrate } from "@/lib/haptics";

/**
 * Campo numérico táctil con botones de − / + a los lados.
 * Acepta decimales con coma ("62,5") y muestra el valor anterior
 * como placeholder fantasma para facilitar la sobrecarga progresiva.
 */
export function NumberField({
  value,
  placeholder,
  step,
  onChange,
  label,
  disabled = false,
}: {
  value: number | null;
  placeholder: number | null;
  step: number;
  onChange: (value: number | null) => void;
  label: string;
  disabled?: boolean;
}) {
  const [text, setText] = useState(value === null ? "" : formatKg(value));

  // Sincronizar cuando el valor cambia desde fuera (copiar anterior, autocompletar)
  useEffect(() => {
    const parsed = parseDecimal(text);
    if (parsed !== value) setText(value === null ? "" : formatKg(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const bump = (dir: 1 | -1) => {
    const base = value ?? placeholder ?? 0;
    const next = Math.max(0, Math.round((base + dir * step) * 100) / 100);
    vibrate(5);
    onChange(next);
  };

  return (
    <div
      className={cx(
        "flex h-12 items-center rounded-xl border bg-raised transition-colors duration-200",
        disabled ? "border-line/50 opacity-55" : "border-line",
      )}
    >
      <button
        type="button"
        aria-label={`Bajar ${label}`}
        disabled={disabled}
        onClick={() => bump(-1)}
        className="flex h-full w-8 shrink-0 items-center justify-center text-faint active:text-ink"
        tabIndex={-1}
      >
        <Minus className="size-3.5" />
      </button>
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
        className="tnum w-full min-w-0 bg-transparent text-center font-mono text-[17px] font-semibold text-ink placeholder:font-normal placeholder:text-faint/50"
      />
      <button
        type="button"
        aria-label={`Subir ${label}`}
        disabled={disabled}
        onClick={() => bump(1)}
        className="flex h-full w-8 shrink-0 items-center justify-center text-faint active:text-ink"
        tabIndex={-1}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
