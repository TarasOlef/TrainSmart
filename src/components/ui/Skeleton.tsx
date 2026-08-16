import { cx } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cx("animate-pulse rounded-xl bg-raised", className)}
    />
  );
}

/** Skeleton con forma de tarjeta de lista (título + metadatos). */
export function CardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="mt-3 h-3.5 w-40" />
    </div>
  );
}
