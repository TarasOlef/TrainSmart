"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Play, Settings2 } from "lucide-react";
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
      {/* Cabecera de marca */}
      <div className="flex items-center justify-between pt-6">
        <p className="text-[17px] font-bold tracking-tight">
          Train<span className="text-lime">Smart</span>
        </p>
        <Link
          href="/rutinas"
          aria-label="Gestionar rutinas"
          className="flex size-10 items-center justify-center rounded-full text-faint active:text-dim"
        >
          <Settings2 className="size-5" strokeWidth={1.75} />
        </Link>
      </div>

      <header className="mt-8">
        <p className="text-[15px] text-dim">{greeting()}</p>
        <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight">
          ¿Quién entrena hoy?
        </h1>
      </header>

      {/* Recuperación de una sesión interrumpida */}
      {hydrated && session && (
        <button
          onClick={() => router.push("/workout")}
          className="mt-6 flex w-full animate-rise items-center gap-3 rounded-card border border-lime/40 bg-lime/10 p-4 text-left"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lime text-bg">
            <Play className="size-5 fill-current" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">
              Entrenamiento en curso
            </span>
            <span className="block truncate text-[13px] text-dim">
              {sessionOwnerName(people, session.personId)} · {session.routineName} ·
              empezado {relativeDays(session.startedAt)}
            </span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-lime">Reanudar</span>
        </button>
      )}

      {/* Tarjetas de persona */}
      <div className="mt-6 flex flex-col gap-3">
        {people === null ? (
          <>
            <PersonSkeleton />
            <PersonSkeleton />
          </>
        ) : (
          people.map((person) => {
            const last = lastSessions[person.id];
            const isLast = lastPerson === person.id;
            return (
              <button
                key={person.id}
                onClick={() => pick(person.id)}
                className={cx(
                  "flex w-full items-center gap-4 rounded-card border bg-surface p-5 text-left transition-transform duration-150 active:scale-[0.985]",
                  isLast ? "border-lime/50" : "border-line",
                )}
              >
                <span
                  aria-hidden
                  className={cx(
                    "flex size-13 shrink-0 items-center justify-center rounded-full text-xl font-bold",
                    isLast
                      ? "bg-lime text-bg"
                      : "border border-line bg-raised text-dim",
                  )}
                >
                  {person.initial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-semibold leading-tight">
                    {person.name}
                  </span>
                  <span className="mt-1 block truncate text-[13px] text-dim">
                    {last === undefined ? (
                      "…"
                    ) : last === null ? (
                      "Todavía sin entrenamientos"
                    ) : (
                      <>
                        Último: {last.routineName} · {relativeDays(last.startedAt)} ·{" "}
                        {formatDuration(last.durationMin)}
                      </>
                    )}
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-faint" />
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
    <div className="flex items-center gap-4 rounded-card border border-line bg-surface p-5">
      <Skeleton className="size-13 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-2 h-3.5 w-44" />
      </div>
    </div>
  );
}
