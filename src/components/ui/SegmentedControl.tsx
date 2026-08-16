"use client";

import { cx } from "@/lib/utils";
import { vibrate } from "@/lib/haptics";

/**
 * Control segmentado de iOS: la pastilla se desliza hasta la opción elegida
 * con la curva del sistema, en lugar de encenderse y apagarse.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  return (
    <div
      role="tablist"
      className="relative flex rounded-full border border-line bg-surface p-1"
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full bg-raised shadow-[0_6px_16px_-10px_rgba(0,0,0,0.9)] transition-transform duration-[420ms] ease-ios"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translate3d(${index * 100}%, 0, 0)`,
        }}
      />
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => {
              if (!active) vibrate(8);
              onChange(opt.value);
            }}
            className={cx(
              "relative z-10 h-10 flex-1 rounded-full text-[15px] transition-colors duration-300",
              active ? "font-semibold text-ink" : "font-medium text-faint active:text-dim",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
