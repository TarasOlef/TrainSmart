"use client";

import { Alert } from "./Alert";

/** Confirmación de acciones importantes, como alerta de iOS. */
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
    <Alert
      open={open}
      onClose={onCancel}
      title={title}
      message={message}
      actions={[
        { label: "Cancelar", onSelect: onCancel, cancel: true },
        {
          label: confirmLabel,
          onSelect: onConfirm,
          destructive,
          preferred: true,
        },
      ]}
    />
  );
}
