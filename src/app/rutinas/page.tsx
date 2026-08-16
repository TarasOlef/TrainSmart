"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Dumbbell,
  Minus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { BottomNav, BottomNavSpacer } from "@/components/BottomNav";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { getLastPersonId, getRoutines, saveRoutines, setLastPersonId } from "@/lib/data";
import type { Exercise, PersonId, WorkoutRoutine } from "@/lib/types";
import { cx, uid } from "@/lib/utils";

/** Objetivo de una edición: rutina (crear/renombrar) o ejercicio. */
type RoutineTarget = { mode: "create" } | { mode: "rename"; routine: WorkoutRoutine };
type ExerciseTarget = { routineId: string; exercise: Exercise | null };

export default function RoutinesPage() {
  const toast = useToast();
  const [person, setPerson] = useState<PersonId>("blanca");
  const [routines, setRoutines] = useState<WorkoutRoutine[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [routineTarget, setRoutineTarget] = useState<RoutineTarget | null>(null);
  const [exerciseTarget, setExerciseTarget] = useState<ExerciseTarget | null>(null);
  const [deleteRoutine, setDeleteRoutine] = useState<WorkoutRoutine | null>(null);

  useEffect(() => {
    setPerson(getLastPersonId() ?? "blanca");
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRoutines(null);
    setExpandedId(null);
    getRoutines(person).then((r) => {
      if (!cancelled) setRoutines(r);
    });
    return () => {
      cancelled = true;
    };
  }, [person]);

  /** Aplica y persiste una mutación de la lista de rutinas. */
  const commit = (next: WorkoutRoutine[], message?: string) => {
    setRoutines(next);
    void saveRoutines(person, next).then(() => {
      if (message) toast(message);
    });
  };

  const move = (list: WorkoutRoutine[], index: number, dir: -1 | 1) => {
    const next = [...list];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    commit(next);
  };

  const moveExercise = (routine: WorkoutRoutine, index: number, dir: -1 | 1) => {
    if (!routines) return;
    const exercises = [...routine.exercises];
    const target = index + dir;
    if (target < 0 || target >= exercises.length) return;
    const [item] = exercises.splice(index, 1);
    exercises.splice(target, 0, item!);
    commit(routines.map((r) => (r.id === routine.id ? { ...r, exercises } : r)));
  };

  return (
    <main className="px-5 pt-safe">
      <div className="flex items-end justify-between pt-8">
        <h1 className="font-display text-[34px] font-extrabold leading-none tracking-tight">
          Rutinas
        </h1>
        <Button size="sm" variant="surface" onClick={() => setRoutineTarget({ mode: "create" })}>
          <Plus className="size-4" /> Nuevo día
        </Button>
      </div>

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

      <div className="mt-4 flex flex-col gap-3">
        {routines === null ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : routines.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="Sin rutinas todavía"
            message="Crea el primer día de entrenamiento: por ejemplo Push, Pull o Legs."
            action={
              <Button variant="primary" onClick={() => setRoutineTarget({ mode: "create" })}>
                <Plus className="size-4" /> Crear día
              </Button>
            }
          />
        ) : (
          routines.map((routine, index) => {
            const expanded = expandedId === routine.id;
            return (
              <section
                key={routine.id}
                className={cx(
                  "overflow-hidden rounded-card border bg-surface transition-colors duration-200",
                  expanded ? "border-line" : "border-line/60",
                )}
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : routine.id)}
                  aria-expanded={expanded}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-display text-[20px] font-bold tracking-tight">
                      {routine.name}
                    </h2>
                    <p className="mt-1 font-mono text-[11px] text-faint">
                      {routine.exercises.length} ejercicios
                    </p>
                  </div>
                  <ChevronDown
                    className={cx(
                      "size-4 text-faint transition-transform duration-200",
                      expanded && "rotate-180",
                    )}
                  />
                </button>

                {expanded && (
                  <div className="animate-fade px-4 pb-4">
                    {/* Ejercicios */}
                    <div className="flex flex-col gap-1.5">
                      {routine.exercises.map((exercise, i) => (
                        <div
                          key={exercise.id}
                          className="flex items-center gap-1 rounded-xl border border-line bg-raised py-1 pl-3.5 pr-1"
                        >
                          <button
                            onClick={() => setExerciseTarget({ routineId: routine.id, exercise })}
                            className="min-w-0 flex-1 py-1.5 text-left"
                          >
                            <span className="block truncate text-[15px] font-medium">
                              {exercise.name}
                            </span>
                            <span className="block font-mono text-[11px] text-faint">
                              {exercise.targetSets} series
                              {exercise.muscleGroup ? ` · ${exercise.muscleGroup}` : ""}
                            </span>
                          </button>
                          <IconBtn
                            label={`Subir ${exercise.name}`}
                            disabled={i === 0}
                            onClick={() => moveExercise(routine, i, -1)}
                          >
                            <ChevronUp className="size-4" />
                          </IconBtn>
                          <IconBtn
                            label={`Bajar ${exercise.name}`}
                            disabled={i === routine.exercises.length - 1}
                            onClick={() => moveExercise(routine, i, 1)}
                          >
                            <ChevronDown className="size-4" />
                          </IconBtn>
                          <IconBtn
                            label={`Editar ${exercise.name}`}
                            onClick={() => setExerciseTarget({ routineId: routine.id, exercise })}
                          >
                            <Pencil className="size-3.5" />
                          </IconBtn>
                        </div>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      variant="surface"
                      className="mt-3 w-full"
                      onClick={() => setExerciseTarget({ routineId: routine.id, exercise: null })}
                    >
                      <Plus className="size-4" /> Añadir ejercicio
                    </Button>

                    {/* Acciones de la rutina */}
                    <div className="mt-4 flex items-center gap-1 border-t border-line/60 pt-3">
                      <IconBtn
                        label="Renombrar rutina"
                        onClick={() => setRoutineTarget({ mode: "rename", routine })}
                      >
                        <Pencil className="size-4" />
                      </IconBtn>
                      <IconBtn
                        label="Duplicar rutina"
                        onClick={() => {
                          if (!routines) return;
                          const copy: WorkoutRoutine = {
                            ...routine,
                            id: uid("routine"),
                            name: `${routine.name} (copia)`,
                            exercises: routine.exercises.map((e) => ({ ...e, id: uid("ex") })),
                          };
                          commit([...routines, copy], "Rutina duplicada");
                        }}
                      >
                        <Copy className="size-4" />
                      </IconBtn>
                      <IconBtn
                        label="Subir rutina"
                        disabled={index === 0}
                        onClick={() => move(routines, index, -1)}
                      >
                        <ChevronUp className="size-4" />
                      </IconBtn>
                      <IconBtn
                        label="Bajar rutina"
                        disabled={index === routines.length - 1}
                        onClick={() => move(routines, index, 1)}
                      >
                        <ChevronDown className="size-4" />
                      </IconBtn>
                      <div className="flex-1" />
                      <IconBtn label="Eliminar rutina" danger onClick={() => setDeleteRoutine(routine)}>
                        <Trash2 className="size-4" />
                      </IconBtn>
                    </div>
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {/* Crear / renombrar rutina */}
      <RoutineSheet
        target={routineTarget}
        onClose={() => setRoutineTarget(null)}
        onSubmit={(name) => {
          if (!routines || !routineTarget) return;
          if (routineTarget.mode === "create") {
            const routine: WorkoutRoutine = {
              id: uid("routine"),
              personId: person,
              name,
              order: routines.length,
              exercises: [],
            };
            commit([...routines, routine], "Día creado");
            setExpandedId(routine.id);
          } else {
            commit(
              routines.map((r) =>
                r.id === routineTarget.routine.id ? { ...r, name } : r,
              ),
            );
          }
          setRoutineTarget(null);
        }}
      />

      {/* Crear / editar ejercicio */}
      <ExerciseSheet
        target={exerciseTarget}
        onClose={() => setExerciseTarget(null)}
        onSubmit={(name, targetSets) => {
          if (!routines || !exerciseTarget) return;
          commit(
            routines.map((r) => {
              if (r.id !== exerciseTarget.routineId) return r;
              if (exerciseTarget.exercise) {
                return {
                  ...r,
                  exercises: r.exercises.map((e) =>
                    e.id === exerciseTarget.exercise!.id ? { ...e, name, targetSets } : e,
                  ),
                };
              }
              return {
                ...r,
                exercises: [...r.exercises, { id: uid("ex"), name, targetSets }],
              };
            }),
          );
          setExerciseTarget(null);
        }}
        onDelete={(exerciseId) => {
          if (!routines || !exerciseTarget) return;
          commit(
            routines.map((r) =>
              r.id === exerciseTarget.routineId
                ? { ...r, exercises: r.exercises.filter((e) => e.id !== exerciseId) }
                : r,
            ),
            "Ejercicio eliminado",
          );
          setExerciseTarget(null);
        }}
      />

      {/* Eliminar rutina */}
      <ConfirmDialog
        open={deleteRoutine !== null}
        title={`¿Eliminar ${deleteRoutine?.name}?`}
        message="Se eliminará el día y sus ejercicios. El historial de sesiones no se toca."
        confirmLabel="Eliminar rutina"
        destructive
        onConfirm={() => {
          if (routines && deleteRoutine) {
            commit(routines.filter((r) => r.id !== deleteRoutine.id), "Rutina eliminada");
          }
          setDeleteRoutine(null);
        }}
        onCancel={() => setDeleteRoutine(null)}
      />

      <BottomNavSpacer />
      <BottomNav />
    </main>
  );
}

function IconBtn({
  label,
  onClick,
  disabled = false,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "flex size-10 items-center justify-center rounded-full transition-colors",
        danger ? "text-danger" : "text-dim active:text-ink",
        disabled && "opacity-30",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Sheets de edición                                                   */
/* ------------------------------------------------------------------ */

function RoutineSheet({
  target,
  onClose,
  onSubmit,
}: {
  target: RoutineTarget | null;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(target?.mode === "rename" ? target.routine.name : "");
  }, [target]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  };

  return (
    <Sheet
      open={target !== null}
      onClose={onClose}
      title={target?.mode === "rename" ? "Renombrar día" : "Nuevo día de entrenamiento"}
    >
      <form onSubmit={submit}>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Push, Pull, Legs…"
          className="w-full rounded-2xl border border-line bg-raised px-4 py-3.5 text-base text-ink placeholder:text-faint"
        />
        <Button type="submit" size="lg" variant="primary" className="mt-4 w-full" disabled={!name.trim()}>
          {target?.mode === "rename" ? "Guardar cambios" : "Crear día"}
        </Button>
      </form>
    </Sheet>
  );
}

function ExerciseSheet({
  target,
  onClose,
  onSubmit,
  onDelete,
}: {
  target: ExerciseTarget | null;
  onClose: () => void;
  onSubmit: (name: string, targetSets: number) => void;
  onDelete: (exerciseId: string) => void;
}) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState(3);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editing = target?.exercise ?? null;

  useEffect(() => {
    setName(target?.exercise?.name ?? "");
    setSets(target?.exercise?.targetSets ?? 3);
    setConfirmDelete(false);
  }, [target]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim(), sets);
  };

  return (
    <Sheet
      open={target !== null}
      onClose={onClose}
      title={editing ? "Editar ejercicio" : "Añadir ejercicio"}
    >
      <form onSubmit={submit}>
        <input
          autoFocus={!editing}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del ejercicio"
          className="w-full rounded-2xl border border-line bg-raised px-4 py-3.5 text-base text-ink placeholder:text-faint"
        />

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-raised px-4 py-3">
          <span className="text-[15px] text-dim">Series iniciales</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Menos series"
              onClick={() => setSets((s) => Math.max(1, s - 1))}
              className="flex size-9 items-center justify-center rounded-full border border-line text-dim active:text-ink"
            >
              <Minus className="size-4" />
            </button>
            <span className="tnum w-5 text-center font-mono text-lg font-semibold">{sets}</span>
            <button
              type="button"
              aria-label="Más series"
              onClick={() => setSets((s) => Math.min(10, s + 1))}
              className="flex size-9 items-center justify-center rounded-full border border-line text-dim active:text-ink"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <Button type="submit" size="lg" variant="primary" className="mt-5 w-full" disabled={!name.trim()}>
          {editing ? "Guardar cambios" : "Añadir ejercicio"}
        </Button>

        {editing &&
          (confirmDelete ? (
            <Button
              type="button"
              size="lg"
              variant="danger"
              className="mt-2.5 w-full"
              onClick={() => onDelete(editing.id)}
            >
              <Trash2 className="size-4" /> Confirmar eliminación
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              variant="ghost"
              className="mt-2.5 w-full text-danger"
              onClick={() => setConfirmDelete(true)}
            >
              Eliminar ejercicio
            </Button>
          ))}
      </form>
    </Sheet>
  );
}
