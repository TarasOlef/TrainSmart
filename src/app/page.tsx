"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Play, Settings2 } from "lucide-react";
import { BottomNav, BottomNavSpacer } from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getLastPersonId,
  getLastSession,
  getPeople,
  setLastPersonId,
} from "@/lib/data";
import type { PersonId, UserProfile, WorkoutSession } from "@/lib/types";
import { useWorkout } from "@/lib/workout-store";
import { cx, formatDuration, greeting, relativeDays } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const { session, hydrated } = useWorkout();
  const [people, setPeople] = useState<UserProfile[] | null>(null);
  const [lastSessions, setLastSessions] = useState<Record<string, WorkoutSession | null>>({});
  const [lastPerson, setLastPerson] = useState<PersonId | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLastPerson(getLastPersonId());
    (async () => {
      const list = await getPeople();
      if (cancelled) return;
      setPeople(list);
      const entries = await Promise.all(
        list.map(async (p) => [p.id, await getLastSession(p.id)] as const),
      );
      if (!cancelled) setLastSessions(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pick = (id: PersonId) => {
    setLastPersonId(id);
    router.push(`/p/${id}`);
  };

  return (
    <main className="px-5 pt-safe">
      <div className="flex items-center justify-between pt-6">
        <p className="font-display text-[17px] font-extrabold tracking-tight">
          Train<span className="text-accent">Smart</span>
        </p>
        <Link
          href="/rutinas"
          aria-label="Gestionar rutinas"
          className="flex size-10 items-center justify-center rounded-full text-faint active:text-dim"
        >
          <Settings2 className="size-5" strokeWidth={1.75} />
        </Link>
      </div>

      <header className="mt-9">
        <p className="eyebrow text-faint">{greeting()}</p>
        <h1 className="mt-2.5 font-display text-[34px] font-extrabold leading-[1.05] tracking-tight">
          ¿Quién entrena
          <br />
          hoy?
        </h1>
      </header>

      {/* Sesión interrumpida: lo primero que se puede retomar */}
      {hydrated && session && (
        <button
          onClick={() => router.push("/workout")}
          className="mt-7 flex w-full animate-rise items-center gap-3.5 rounded-card border border-accent/35 bg-accent/8 p-4 text-left"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-bg">
            <Play className="size-5 fill-current" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">Entrenamiento en curso</span>
            <span className="mt-0.5 block truncate font-mono text-[11px] text-dim">
              {sessionOwnerName(people, session.personId)} · {session.routineName} ·{" "}
              {relativeDays(session.startedAt)}
            </span>
          </span>
          <span className="shrink-0 text-[13px] font-semibold text-accent">Reanudar</span>
        </button>
      )}

      <div className="mt-7 flex flex-col gap-3">
        {people === null ? (
          <>
            <PersonSkeleton />
            <PersonSkeleton />
          </>
        ) : (
          people.map((person, i) => {
            const last = lastSessions[person.id];
            const isLast = lastPerson === person.id;
            return (
              <button
                key={person.id}
                onClick={() => pick(person.id)}
                className={cx(
                  "relative flex min-h-[11.5rem] w-full animate-rise flex-col justify-between overflow-hidden rounded-tile border bg-surface p-5 text-left transition-transform duration-200 active:scale-[0.985]",
                  isLast ? "border-accent/35" : "border-line",
                  i === 1 && "stagger-2",
                )}
              >
                {/* La inicial como marca tipográfica, sangrando por el borde */}
                <span
                  aria-hidden
                  className={cx(
                    "pointer-events-none absolute bottom-0 right-6 font-display text-[8.5rem] font-extrabold leading-none",
                    isLast ? "text-accent/12" : "text-ink/[0.07]",
                  )}
                >
                  {person.initial}
                </span>

                <span className="flex items-start justify-between gap-3">
                  <span className={cx("eyebrow", isLast ? "text-accent" : "text-faint")}>
                    {isLast ? "Último en entrenar" : " "}
                  </span>
                  <ArrowUpRight className="size-5 shrink-0 text-faint" strokeWidth={1.75} />
                </span>

                <span className="relative">
                  <span className="block font-display text-[2rem] font-extrabold leading-none tracking-tight">
                    {person.name}
                  </span>
                  <span className="mt-2.5 block truncate font-mono text-[11.5px] text-dim">
                    {last === undefined ? (
                      "…"
                    ) : last === null ? (
                      "Sin entrenamientos todavía"
                    ) : (
                      <>
                        {last.routineName} · {relativeDays(last.startedAt)} ·{" "}
                        {formatDuration(last.durationMin)}
                      </>
                    )}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>

      <BottomNavSpacer />
      <BottomNav />
    </main>
  );
}

function sessionOwnerName(people: UserProfile[] | null, id: PersonId): string {
  return people?.find((p) => p.id === id)?.name ?? (id === "blanca" ? "Blanca" : "Taras");
}

function PersonSkeleton() {
  return (
    <div className="flex min-h-[11.5rem] flex-col justify-end rounded-tile border border-line/70 bg-surface/60 p-5">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-3 h-3 w-44" />
    </div>
  );
}
