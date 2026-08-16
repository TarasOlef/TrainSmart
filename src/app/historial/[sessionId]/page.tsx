"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, StickyNote, Trophy } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { getSession } from "@/lib/data";
import { PEOPLE } from "@/lib/mock-data";
import type { WorkoutSession } from "@/lib/types";
import { cx, formatDuration, formatKg, formatLongDate } from "@/lib/utils";

export default function SessionDetailPage() {
  const params = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<WorkoutSession | null | "loading">("loading");

  useEffect(() => {
    let cancelled = false;
    getSession(params.sessionId).then((s) => {
      if (!cancelled) setSession(s);
    });
    return () => {
      cancelled = true;
    };
  }, [params.sessionId]);

  if (session === "loading") {
    return (
      <main>
        <TopBar title="Sesión" />
        <div className="flex flex-col gap-3 px-5 pt-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </main>
    );
  }

  if (session === null) {
    return (
      <main>
        <TopBar title="Sesión" />
        <p className="px-8 pt-16 text-center text-[15px] text-dim">
          No se encontró esta sesión. Puede que aún no se haya sincronizado.
        </p>
      </main>
    );
  }

  const person = PEOPLE.find((p) => p.id === session.personId);

  return (
    <main className="pb-10">
      <TopBar
        title={session.routineName}
        subtitle={`${person?.name} · ${formatLongDate(session.startedAt)} · ${formatDuration(session.durationMin)}`}
      />

      <div className="flex flex-col gap-3 px-5 pt-4">
        {session.achievements && session.achievements.length > 0 && (
          <div className="flex flex-col gap-2">
            {session.achievements.map((a) => (
              <div
                key={a}
                className="flex items-center gap-3 rounded-2xl border border-lime/25 bg-lime/8 px-4 py-3"
              >
                <Trophy className="size-4 shrink-0 text-lime" />
                <span className="text-sm font-medium">{a}</span>
              </div>
            ))}
          </div>
        )}

        {session.exercises.map((exercise, i) => (
          <section
            key={exercise.id}
            className="rounded-card border border-line bg-surface p-4"
          >
            <div className="flex items-baseline gap-2.5">
              <span className="tnum text-[13px] font-semibold text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="text-[17px] font-semibold">{exercise.name}</h2>
              {exercise.muscleGroup && (
                <span className="text-xs text-faint">{exercise.muscleGroup}</span>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-1">
              {exercise.sets.map((set, j) => (
                <div
                  key={set.id}
                  className={cx(
                    "flex items-center gap-3 rounded-lg px-2 py-1.5",
                    set.completed ? "" : "opacity-40",
                  )}
                >
                  <span className="tnum w-4 text-[13px] text-faint">{j + 1}</span>
                  <span className="tnum flex-1 text-[15px] font-medium">
                    {formatKg(set.weightKg)} kg × {set.reps ?? "–"}
                  </span>
                  {set.completed && (
                    <Check className="size-4 text-lime" strokeWidth={2.5} />
                  )}
                </div>
              ))}
            </div>

            {exercise.note && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-raised px-3 py-2.5 text-[13px] leading-relaxed text-dim">
                <StickyNote className="mt-0.5 size-3.5 shrink-0 text-faint" />
                {exercise.note}
              </p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
