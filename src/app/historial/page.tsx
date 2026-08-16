"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, TrendingUp } from "lucide-react";
import { BottomNav, BottomNavSpacer } from "@/components/BottomNav";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { getLastPersonId, getSessions, setLastPersonId } from "@/lib/data";
import type { PersonId, WorkoutSession } from "@/lib/types";
import { sessionSets, sessionVolume } from "@/lib/workout-store";
import { dateParts, formatDuration, formatVolume } from "@/lib/utils";

export default function HistoryPage() {
  const [person, setPerson] = useState<PersonId>("blanca");
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null);

  useEffect(() => {
    setPerson(getLastPersonId() ?? "blanca");
  }, []);

  useEffect(() => {
    let cancelled = false;
    setSessions(null);
    getSessions(person).then((s) => {
      if (!cancelled) setSessions(s.filter((x) => x.endedAt));
    });
    return () => {
      cancelled = true;
    };
  }, [person]);

  return (
    <main className="px-5 pt-safe">
      <h1 className="pt-8 font-display text-[34px] font-extrabold leading-none tracking-tight">
        Historial
      </h1>

      <div className="mt-5">
        <SegmentedControl
          options={[
            { value: "blanca" as PersonId, label: "Blanca" },
            { value: "taras" as PersonId, label: "Taras" },
          ]}
          value={person}
          onChange={(p) => {
            setPerson(p);
            setLastPersonId(p);
          }}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {sessions === null ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Todavía no hay entrenamientos"
            message="Cuando termines tu primera sesión aparecerá aquí, lista para comparar."
          />
        ) : (
          sessions.map((session) => {
            const improved = (session.achievements?.length ?? 0) > 0;
            const { day, month } = dateParts(session.startedAt);
            return (
              <Link
                key={session.id}
                href={`/historial/${session.id}`}
                className="flex animate-rise items-center gap-4 rounded-card border border-line bg-surface p-4 transition-transform duration-200 active:scale-[0.985]"
              >
                <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border border-line/70 bg-raised">
                  <span className="font-display text-[19px] font-extrabold leading-none">
                    {day}
                  </span>
                  <span className="eyebrow mt-1 text-faint">{month}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-display text-[17px] font-bold tracking-tight">
                      {session.routineName}
                    </h2>
                    {improved && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full border border-accent/30 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        <TrendingUp className="size-3" /> Progreso
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate font-mono text-[11px] text-faint">
                    {formatDuration(session.durationMin)} · {sessionSets(session)} series ·{" "}
                    {formatVolume(sessionVolume(session))} kg
                  </p>
                </div>

                <ChevronRight className="size-5 shrink-0 text-faint" />
              </Link>
            );
          })
        )}
      </div>

      <BottomNavSpacer />
      <BottomNav />
    </main>
  );
}
