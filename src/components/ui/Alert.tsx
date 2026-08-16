"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

export interface AlertAction {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
  /** La opción por defecto va en negrita, como en iOS. */
  preferred?: boolean;
  /** La de cancelar cae al final cuando las acciones se apilan. */
  cancel?: boolean;
}

/**
 * Alerta centrada al estilo de iOS: entra con un pequeño rebote desde algo más
 * grande, el fondo se desenfoca y las acciones se separan con filetes. Con dos
 * acciones se reparten en fila; con más, se apilan.
 */
export function Alert({
  open,
  onClose,
  title,
  message,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  actions: AlertAction[];
}) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const id = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, 180);
    return () => clearTimeout(id);
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted || closing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mounted, closing, onClose]);

  if (!mounted) return null;

  // Dos acciones cortas caben en fila; si alguna es larga, se apilan (y la de
  // cancelar baja al final), igual que hace iOS
  const side = actions.length === 2 && actions.every((a) => a.label.length <= 14);
  const ordered = side
    ? actions
    : [...actions].sort((a, b) => Number(a.cancel ?? false) - Number(b.cancel ?? false));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-10">
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className={cx(
          "absolute inset-0 bg-black/45 backdrop-blur-md",
          closing ? "animate-backdrop-out" : "animate-backdrop-in",
        )}
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cx(
          "relative w-full max-w-[17.5rem] overflow-hidden rounded-[1.125rem] border border-line/60 bg-surface/95 backdrop-blur-2xl outline-none",
          closing ? "animate-alert-out" : "animate-alert-in",
        )}
      >
        <div className="px-5 pb-5 pt-6 text-center">
          <h2 className="font-display text-[17px] font-bold leading-snug tracking-tight">
            {title}
          </h2>
          {message && (
            <p className="mt-2 text-[13px] leading-relaxed text-dim">{message}</p>
          )}
        </div>

        <div className="hairline" aria-hidden />

        <div className={cx("flex", side ? "flex-row" : "flex-col")}>
          {ordered.map((action, i) => (
            <div
              key={action.label}
              className={cx("flex", side ? "flex-1 flex-row" : "flex-col")}
            >
              {i > 0 &&
                (side ? (
                  <div aria-hidden className="w-px bg-line" />
                ) : (
                  <div aria-hidden className="hairline" />
                ))}
              <button
                onClick={() => {
                  haptics.tick();
                  action.onSelect();
                }}
                className={cx(
                  "row-press min-h-12 flex-1 px-3 py-3 text-[17px]",
                  action.preferred ? "font-semibold" : "font-normal",
                  action.destructive ? "text-danger" : "text-accent",
                )}
              >
                {action.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
