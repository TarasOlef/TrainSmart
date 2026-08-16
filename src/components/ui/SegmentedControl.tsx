"use client";

import { cx } from "@/lib/utils";

/** Selector de dos o tres opciones estilo iOS. */
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
      className="flex gap-1 rounded-2xl border border-line bg-surface p-1"
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
              "h-10 flex-1 rounded-xl text-[15px] font-medium transition-colors duration-150",
              active ? "bg-raised text-ink shadow-sm shadow-black/20" : "text-dim",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
