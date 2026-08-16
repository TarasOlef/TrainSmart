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
    <div className="flex animate-rise flex-col items-center px-8 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full border border-dashed border-line bg-surface/60">
        <Icon className="size-6 text-faint" strokeWidth={1.5} />
      </div>
      <h2 className="mt-6 font-display text-xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-64 text-[15px] leading-relaxed text-dim">{message}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
