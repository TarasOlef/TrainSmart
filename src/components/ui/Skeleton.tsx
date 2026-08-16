import { cx } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cx("animate-pulse rounded-xl bg-raised/80", className)}
    />
  );
}

/** Skeleton con forma de tarjeta de lista (título + metadatos). */
export function CardSkeleton() {
  return (
    <div className="rounded-card border border-line/70 bg-surface/60 p-5">
      <Skeleton className="h-6 w-28" />
      <Skeleton className="mt-3 h-3 w-44" />
    </div>
  );
}
