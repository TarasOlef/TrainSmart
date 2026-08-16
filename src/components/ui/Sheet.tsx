"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cx } from "@/lib/utils";
import { vibrate } from "@/lib/haptics";

/** Distancia y velocidad a partir de las cuales el gesto cierra la hoja. */
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.5; // px por ms

/**
 * Hoja inferior al estilo de iOS: entra con la curva del sistema, se arrastra
 * con el dedo (con resistencia elástica al tirar hacia arriba) y se cierra al
 * soltar si has bajado lo suficiente o con gesto rápido. Cierra también con el
 * fondo o con Escape.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  /** Sin acolchado ni fondo: para hojas que dibujan sus propios grupos. */
  bare = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  bare?: boolean;
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
        aria-label={title}
        tabIndex={-1}
        {...dragHandlers}
        style={drag.style}
        className={cx(
          "relative w-full max-w-md touch-none outline-none will-change-transform",
          closing ? "animate-sheet-out" : "animate-sheet-in",
          bare
            ? "px-3 pb-safe-4"
            : "rounded-t-[2rem] border-t border-line bg-surface px-5 pt-3 pb-safe-8 shadow-[0_-24px_60px_-30px_rgba(0,0,0,1)]",
        )}
      >
        {!bare && (
          <>
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line" aria-hidden />
            {title && (
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-raised text-dim transition-transform duration-150 active:scale-90 active:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
          </>
        )}
        {children}
      </div>
    </div>
  );
}

/**
 * Gestión compartida por la hoja y el menú de acciones: montaje diferido para
 * poder animar la salida, bloqueo del fondo y arrastre con el dedo.
 */
export function useSheetGesture(open: boolean, onClose: () => void) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);
  const start = useRef({ y: 0, t: 0 });
  const last = useRef({ y: 0, t: 0 });

  // Montar al abrir; al cerrar, dejar que termine la animación de salida
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      setOffset(0);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const id = setTimeout(() => {
      setMounted(false);
      setClosing(false);
      setOffset(0);
    }, 260);
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

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    // No secuestrar el gesto si empieza sobre un campo de texto
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, select")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { y: e.clientY, t: e.timeStamp };
    last.current = { y: e.clientY, t: e.timeStamp };
    setDragging(true);
  }, []);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      const dy = e.clientY - start.current.y;
      last.current = { y: e.clientY, t: e.timeStamp };
      // Resistencia elástica al tirar hacia arriba
      setOffset(dy < 0 ? dy / 4 : dy);
    },
    [dragging],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      setDragging(false);
      const dy = e.clientY - start.current.y;
      const dt = Math.max(1, e.timeStamp - last.current.t + 16);
      const velocity = (e.clientY - last.current.y) / dt;
      if (dy > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {
        vibrate(6);
        // Continuar la salida desde donde está el dedo
        panelRef.current?.style.setProperty("--sheet-from", `${dy}px`);
        onClose();
      } else {
        setOffset(0);
      }
    },
    [dragging, onClose],
  );

  // El fondo se aclara conforme bajas la hoja
  useEffect(() => {
    const el = backdropRef.current;
    if (!el) return;
    el.style.opacity = offset > 0 ? String(Math.max(0.15, 1 - offset / 320)) : "";
  }, [offset]);

  return {
    mounted,
    closing,
    panelRef,
    backdropRef,
    drag: {
      style: {
        transform: offset ? `translate3d(0, ${offset}px, 0)` : undefined,
        transition: dragging ? "none" : "transform 0.42s var(--ease-ios)",
      } as React.CSSProperties,
    },
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
