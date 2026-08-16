"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, StickyNote, Trophy } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { getSession } from "@/lib/data";
import { PEOPLE } from "@/lib/mock-data";
import type { WorkoutSession } from "@/lib/types";
import { sessionSets, sessionVolume } from "@/lib/workout-store";
import { cx, formatDuration, formatKg, formatLongDate, formatVolume } from "@/lib/utils";

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
        <div className="flex flex-col gap-3 px-4 pt-5">
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
    <main className="pb-12">
      <TopBar
        title={session.routineName}
        subtitle={`${person?.name} · ${formatLongDate(session.startedAt)}`}
      />

      <div className="flex flex-col gap-3 px-4 pt-5">
        {/* Cifras de la sesión */}
        <div className="grid grid-cols-3 gap-2.5">
          <Stat value={formatDuration(session.durationMin)} label="Duración" />
          <Stat value={String(sessionSets(session))} label="Series" />
          <Stat value={`${formatVolume(sessionVolume(session))}`} label="Kg movidos" />
        </div>

        {session.achievements && session.achievements.length > 0 && (
          <div className="flex flex-col gap-2">
            {session.achievements.map((a) => (
              <div
                key={a}
                className="flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/8 px-4 py-3"
              >
                <Trophy className="size-4 shrink-0 text-accent" />
                <span className="text-[15px] font-medium">{a}</span>
              </div>
            ))}
          </div>
        )}

        {session.exercises.map((exercise, i) => (
          <section
            key={exercise.id}
            className="rounded-card border border-line bg-surface p-4"
          >
            <div className="flex items-center gap-2.5">
              <span className="tnum font-mono text-[12px] text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="truncate font-display text-[17px] font-bold tracking-tight">
                {exercise.name}
              </h2>
              {exercise.muscleGroup && (
                <span className="eyebrow shrink-0 rounded-full border border-line px-2 py-0.5 text-faint">
                  {exercise.muscleGroup}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-0.5">
              {exercise.sets.map((set, j) => (
                <div
                  key={set.id}
                  className={cx(
                    "flex items-center gap-3 rounded-lg px-2 py-2",
                    set.completed ? "" : "opacity-35",
                  )}
                >
                  <span className="tnum w-4 font-mono text-[12px] text-faint">{j + 1}</span>
                  <span className="tnum flex-1 font-mono text-[15px] font-medium">
                    {formatKg(set.weightKg)}
                    <span className="text-faint"> kg × </span>
                    {set.reps ?? "–"}
                  </span>
                  {set.completed && <Check className="size-4 text-ink" strokeWidth={3} />}
                </div>
              ))}
            </div>

            {exercise.note && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-raised px-3.5 py-3 text-[13px] leading-relaxed text-dim">
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-card border border-line bg-surface px-3.5 py-3.5">
      <p className="tnum font-mono text-[17px] font-semibold leading-none">{value}</p>
      <p className="eyebrow mt-2 text-faint">{label}</p>
    </div>
  );
}
