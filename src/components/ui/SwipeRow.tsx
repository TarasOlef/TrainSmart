"use client";

import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Trash2 } from "lucide-react";
import { cx } from "@/lib/utils";
import { haptics, vibrate } from "@/lib/haptics";

const ACTION_WIDTH = 88;
const OPEN_THRESHOLD = 40;
const FULL_SWIPE = 200;

/**
 * Fila deslizable de iOS: arrastra hacia la izquierda para descubrir la acción
 * de eliminar, con tope elástico. Un deslizamiento largo la ejecuta directamente.
 * El gesto solo se activa cuando el movimiento es claramente horizontal, para no
 * pelearse con el scroll de la lista.
 */
export function SwipeRow({
  onDelete,
  label = "Eliminar",
  children,
  className,
}: {
  onDelete: () => void;
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef({ x: 0, y: 0, offset: 0 });
  const axis = useRef<"none" | "x" | "y">("none");
  const armed = useRef(false);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      start.current = { x: e.clientX, y: e.clientY, offset };
      axis.current = "none";
      armed.current = false;
    },
    [offset],
  );

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    if (axis.current === "none") {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (axis.current === "x") {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
      }
    }
    if (axis.current !== "x") return;

    let next = start.current.offset + dx;
    if (next > 0) next = next / 5; // resistencia hacia la derecha
    setOffset(next);

    // Aviso háptico al entrar en la zona de borrado directo
    if (next < -FULL_SWIPE && !armed.current) {
      armed.current = true;
      vibrate(12);
    } else if (next > -FULL_SWIPE) {
      armed.current = false;
    }
  }, []);

  const onPointerUp = useCallback(() => {
    if (axis.current !== "x") return;
    setDragging(false);
    axis.current = "none";
    if (offset < -FULL_SWIPE) {
      haptics.warn();
      setOffset(0);
      onDelete();
      return;
    }
    setOffset(offset < -OPEN_THRESHOLD ? -ACTION_WIDTH : 0);
  }, [offset, onDelete]);

  const open = offset < -4;

  return (
    <div className={cx("relative touch-pan-y overflow-hidden rounded-2xl", className)}>
      {/* Acción que asoma por detrás */}
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <button
          tabIndex={open ? 0 : -1}
          aria-hidden={!open}
          onClick={() => {
            haptics.warn();
            setOffset(0);
            onDelete();
          }}
          style={{ width: ACTION_WIDTH }}
          className="flex flex-col items-center justify-center gap-1 bg-danger/90 text-[11px] font-semibold text-bg"
        >
          <Trash2 className="size-4" strokeWidth={2.25} />
          {label}
        </button>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translate3d(${offset}px, 0, 0)`,
          transition: dragging ? "none" : "transform 0.42s var(--ease-ios)",
        }}
        className="relative will-change-transform"
      >
        {children}
        {/* Con la acción a la vista, tocar la fila la vuelve a cerrar */}
        {open && (
          <button
            aria-label="Cerrar acciones"
            onClick={() => setOffset(0)}
            className="absolute inset-0 z-10"
          />
        )}
      </div>
    </div>
  );
}
