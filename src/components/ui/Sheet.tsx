"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cx } from "@/lib/utils";

/**
 * Bottom sheet móvil: se desliza desde abajo, cierra con el fondo,
 * botón o tecla Escape. Bloquea el scroll de fondo mientras está abierto.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Foco al panel para lectores de pantalla y teclado
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Cerrar"
        className="absolute inset-0 animate-fade bg-bg/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cx(
          "relative w-full max-w-md animate-rise rounded-t-[2rem] border-t border-line bg-surface px-5 pt-3 pb-safe-8 shadow-[0_-24px_60px_-30px_rgba(0,0,0,1)] outline-none",
        )}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line" aria-hidden />
        {title && (
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-raised text-dim active:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
