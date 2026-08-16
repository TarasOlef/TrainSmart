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
    <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/90 pt-safe backdrop-blur-lg">
      <div className="flex h-14 items-center gap-1 px-2">
        <button
          onClick={onBack ?? (() => router.back())}
          aria-label="Volver"
          className="flex size-11 items-center justify-center rounded-full text-dim active:text-ink"
        >
          <ChevronLeft className="size-6" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-semibold leading-tight">{title}</h1>
          {subtitle && (
            <p className="truncate text-xs text-faint leading-tight">{subtitle}</p>
          )}
        </div>
        {right && <div className="pr-2">{right}</div>}
      </div>
    </header>
  );
}
