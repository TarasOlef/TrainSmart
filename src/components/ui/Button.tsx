"use client";

import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/utils";

type Variant = "primary" | "surface" | "ghost" | "danger";
type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-bg font-semibold shadow-[0_10px_28px_-14px] shadow-accent/80 active:bg-accent-deep disabled:bg-raised disabled:text-faint disabled:shadow-none",
  surface:
    "bg-raised text-ink border border-line active:bg-line/70 disabled:text-faint",
  ghost: "text-dim active:text-ink disabled:text-faint",
  danger: "bg-danger/10 text-danger border border-danger/25 active:bg-danger/20",
};

const sizes: Record<Size, string> = {
  lg: "h-14 px-7 text-[17px] rounded-full",
  md: "h-11 px-5 text-[15px] rounded-full",
  sm: "h-9 px-4 text-sm rounded-full",
};

export function Button({
  variant = "surface",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-[background-color,transform,color] duration-150 active:scale-[0.97]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
