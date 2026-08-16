"use client";

import { Sheet } from "./Sheet";
import { Button } from "./Button";

/** Confirmación de acciones importantes, en formato bottom sheet. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Sheet open={open} onClose={onCancel}>
      <div className="pt-1">
        <h2 className="font-display text-xl font-bold leading-snug tracking-tight">{title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-dim">{message}</p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            size="lg"
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button size="lg" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
