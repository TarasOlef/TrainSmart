/** Utilidades de formato y pequeños helpers sin dependencias. */

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** "Buenos días" / "Buenas tardes" / "Buenas noches" según la hora local. */
export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 6) return "Buenas noches";
  if (h < 14) return "Buenos días";
  if (h < 21) return "Buenas tardes";
  return "Buenas noches";
}

/** 62.5 -> "62,5" · 60 -> "60" */
export function formatKg(value: number | null | undefined): string {
  if (value === null || value === undefined) return "–";
  return value.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}

/** "62,5" | "62.5" -> 62.5 · "" -> null */
export function parseDecimal(raw: string): number | null {
  const cleaned = raw.trim().replace(",", ".");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** 4320 -> "4.320" · 0 -> "0" (kg movidos en una sesión) */
export function formatVolume(kg: number): string {
  return Math.round(kg).toLocaleString("es-ES");
}

/** Minutos -> "52 min" | "1 h 4 min" */
export function formatDuration(minutes: number | undefined): string {
  if (minutes === undefined) return "–";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** ISO -> "hace 4 días" / "hoy" / "ayer" */
export function relativeDays(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOfDay(now) - startOfDay(then)) / 86_400_000);
  if (diff <= 0) return "hoy";
  if (diff === 1) return "ayer";
  return `hace ${diff} días`;
}

/** ISO -> { day: "14", month: "ago" } para el bloque de fecha del historial */
export function dateParts(iso: string): { day: string; month: string } {
  const d = new Date(iso);
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString("es-ES", { month: "short" }).replace(/\./g, ""),
  };
}

/** ISO -> "Vie 14 ago" */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const text = d.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return text.charAt(0).toUpperCase() + text.slice(1).replace(/\./g, "");
}

/** ISO -> "14 de agosto, 19:00" */
export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long" }) +
    ", " +
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}
