"use client";

import { cx } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import { useSheetGesture } from "./Sheet";

export interface SheetAction {
  label: string;
  onSelect: () => void;
  /** Rojo, para lo que no tiene vuelta atrás. */
  destructive?: boolean;
  disabled?: boolean;
}

/**
 * Menú de acciones al estilo de iOS: un grupo con las opciones separadas por
 * filetes y, despegado, el botón de cancelar. Se arrastra para descartar.
 */
export function ActionSheet({
  open,
  onClose,
  title,
  message,
  actions,
  cancelLabel = "Cancelar",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actions: SheetAction[];
  cancelLabel?: string;
}) {
  const { mounted, closing, panelRef, backdropRef, drag, dragHandlers } =
    useSheetGesture(open, onClose);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        ref={backdropRef}
        aria-label="Cerrar"
        onClick={onClose}
        className={cx(
          "absolute inset-0 bg-black/45 backdrop-blur-[3px]",
          closing ? "animate-backdrop-out" : "animate-backdrop-in",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? cancelLabel}
        tabIndex={-1}
        {...dragHandlers}
        style={drag.style}
        className={cx(
          "relative w-full max-w-md touch-none px-3 pb-safe-4 outline-none will-change-transform",
          closing ? "animate-sheet-out" : "animate-sheet-in",
        )}
      >
        <div className="overflow-hidden rounded-[1.25rem] border border-line/70 bg-surface/95 backdrop-blur-2xl">
          {(title || message) && (
            <div className="px-5 py-4 text-center">
              {title && (
                <p className="font-display text-[15px] font-bold tracking-tight">{title}</p>
              )}
              {message && (
                <p className="mt-1 text-[13px] leading-snug text-dim">{message}</p>
              )}
            </div>
          )}
          {actions.map((action, i) => (
            <div key={action.label}>
              {(i > 0 || title || message) && <div className="hairline" aria-hidden />}
              <button
                disabled={action.disabled}
                onClick={() => {
                  haptics.tick();
                  action.onSelect();
                }}
                className={cx(
                  "row-press flex h-14 w-full items-center justify-center text-[17px]",
                  action.destructive ? "text-danger" : "text-ink",
                  action.disabled && "opacity-35",
                )}
              >
                {action.label}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="row-press mt-2 flex h-14 w-full items-center justify-center rounded-[1.25rem] border border-line/70 bg-raised/95 text-[17px] font-semibold backdrop-blur-2xl"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
