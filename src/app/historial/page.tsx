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
import { formatDuration, formatShortDate } from "@/lib/utils";

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
      <h1 className="pt-6 text-[28px] font-bold tracking-tight">Historial</h1>

      <div className="mt-4">
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

      <div className="mt-4 flex flex-col gap-3">
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
            const exerciseCount = session.exercises.filter((e) =>
              e.sets.some((s) => s.completed),
            ).length;
            return (
              <Link
                key={session.id}
                href={`/historial/${session.id}`}
                className="flex items-center gap-3 rounded-card border border-line bg-surface p-4 transition-transform duration-150 active:scale-[0.985]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[17px] font-semibold">{session.routineName}</h2>
                    {improved && (
                      <span className="flex items-center gap-1 rounded-full bg-lime/12 px-2 py-0.5 text-[11px] font-semibold text-lime">
                        <TrendingUp className="size-3" /> Progreso
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] text-dim">
                    {formatShortDate(session.startedAt)} ·{" "}
                    {formatDuration(session.durationMin)} · {exerciseCount} ejercicios
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
