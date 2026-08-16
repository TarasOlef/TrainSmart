# TrainSmart

Libreta de entrenamiento para Blanca y Taras. Pesos, series y repeticiones sin fricción, pensada para la sobrecarga progresiva.

## Desarrollo

```bash
npm install
npm run dev
```

PWA mobile-first: pruébala con el móvil emulado en las DevTools o instálala desde el navegador (manifest incluido).

## Arquitectura

- **Next.js 15 (App Router) + TypeScript estricto + Tailwind CSS 4 + Lucide.**
- **Sin backend todavía.** Toda la persistencia es mock + `localStorage`.
- `src/lib/types.ts` — tipos de dominio (`UserProfile`, `WorkoutRoutine`, `Exercise`, `WorkoutSession`, `ExerciseSet`, `ExerciseHistory`).
- `src/lib/data.ts` — **capa de acceso a datos**: funciones async con las firmas ya preparadas para sustituir su cuerpo por llamadas al backend real. Es el único módulo que sabe de dónde salen los datos.
- `src/lib/mock-data.ts` — rutinas por defecto, sesiones de ejemplo y sugerencias de progresión.
- `src/lib/workout-store.tsx` — estado de la sesión activa (reducer + Context), persistido en `localStorage` para recuperar sesiones interrumpidas.
- `src/lib/haptics.ts` — vibración opcional (Vibration API, silenciosa si no hay soporte).
- `src/components/` — UI reutilizable (`ui/`), navegación y componentes del entrenamiento (`workout/`).

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Inicio: ¿quién entrena hoy? |
| `/p/[personId]` | Días de entrenamiento de la persona |
| `/workout` | Sesión activa (registro de series + descanso) |
| `/workout/summary` | Resumen al finalizar |
| `/historial` · `/historial/[id]` | Historial y detalle de sesión |
| `/rutinas` | Gestión de días y ejercicios |
