"use client";

import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/utils";

type Variant = "primary" | "surface" | "ghost" | "danger";
type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  primary:
    "bg-lime text-bg font-semibold active:bg-lime-deep disabled:bg-raised disabled:text-faint",
  surface:
    "bg-raised text-ink border border-line active:bg-line/60 disabled:text-faint",
  ghost: "text-dim active:text-ink disabled:text-faint",
  danger: "bg-raised text-danger border border-line active:bg-line/60",
};

const sizes: Record<Size, string> = {
  lg: "h-13 px-6 text-base rounded-2xl",
  md: "h-11 px-5 text-[15px] rounded-xl",
  sm: "h-9 px-3.5 text-sm rounded-lg",
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
        "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-[background-color,transform,color] duration-150 active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
