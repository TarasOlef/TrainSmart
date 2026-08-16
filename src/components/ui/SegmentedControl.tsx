"use client";

import { cx } from "@/lib/utils";

/** Selector de dos o tres opciones. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="tablist"
      className="flex gap-1 rounded-full border border-line bg-surface p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cx(
              "h-10 flex-1 rounded-full text-[15px] transition-colors duration-200",
              active
                ? "bg-raised font-semibold text-ink shadow-[0_6px_16px_-10px_rgba(0,0,0,0.9)]"
                : "font-medium text-faint active:text-dim",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
