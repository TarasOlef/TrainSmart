import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Estado vacío: explica qué falta e invita a actuar. */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-line bg-surface">
        <Icon className="size-6 text-faint" strokeWidth={1.75} />
      </div>
      <h2 className="mt-5 text-[17px] font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-60 text-sm leading-relaxed text-dim">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
