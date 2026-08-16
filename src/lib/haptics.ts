/**
 * Vibración háptica opcional. Silenciosa en dispositivos o navegadores
 * sin soporte (iOS Safari no expone la Vibration API).
 */
export function vibrate(pattern: number | number[] = 10): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // sin soporte: no hacemos nada
  }
}

export const haptics = {
  /** Marcar una serie completada. */
  tick: () => vibrate(15),
  /** Completar un ejercicio. */
  success: () => vibrate([15, 60, 25]),
  /** Fin del descanso. */
  timerDone: () => vibrate([40, 80, 40, 80, 40]),
  /** Acción destructiva confirmada. */
  warn: () => vibrate(30),
};
