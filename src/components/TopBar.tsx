"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

/** Cabecera de pantalla secundaria con botón de volver. */
export function TopBar({
  title,
  subtitle,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 bg-bg/80 pt-safe backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4">
        <button
          onClick={onBack ?? (() => router.back())}
          aria-label="Volver"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-dim transition-colors active:text-ink"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[19px] font-bold leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate font-mono text-[11px] leading-tight text-faint">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
      <div className="mx-4 h-px bg-line/70" aria-hidden />
    </header>
  );
}
