# TrainSmart

Libreta de entrenamiento para Blanca y Taras. Pesos, series y repeticiones sin fricción, pensada para la sobrecarga progresiva.

## Desarrollo

```bash
npm install
npm run dev
```

PWA mobile-first: pruébala con el móvil emulado en las DevTools o instálala desde el navegador (manifest incluido).

## Lenguaje visual

*Pizarra y tiza.* Fondo de pizarra (`#0d1311`), tinta de tiza cálida (`#f0eee5`) y un único acento ámbar (`#ffa338`) con una regla: **el ámbar marca siempre dónde estás ahora** — la serie que toca, el ejercicio abierto, la rutina del día. Lo ya registrado se pinta de tiza, nunca de color.

- Tipografía: Bricolage Grotesque (titulares), Instrument Sans (texto), Geist Mono (cifras y etiquetas).
- Elemento firma: **el listón** (`components/workout/SetRack.tsx`), una muesca por serie de la sesión agrupada por ejercicio. Sustituye a la barra de progreso y aparece también, en pequeño, en cada tarjeta plegada.
- Sin temporizadores: durante el entrenamiento no hay relojes. En su lugar, el panel inferior muestra series hechas y kg movidos.
- Tokens y utilidades (`eyebrow`, `tnum`, `hairline`, `row-press`, safe areas) en `src/app/globals.css`.

### Componentes e interacción al estilo de iOS

| Componente | Comportamiento |
| --- | --- |
| `ui/Sheet` | Hoja inferior que se arrastra para descartar, con resistencia elástica y cierre por velocidad. `useSheetGesture` reutiliza el gesto. |
| `ui/ActionSheet` | Menú de acciones: grupo con filetes, opción destructiva en rojo y "Cancelar" despegado. |
| `ui/Alert` | Alerta centrada con rebote. Dos acciones cortas van en fila; si alguna es larga se apilan y "Cancelar" baja al final. |
| `ui/SwipeRow` | Deslizar una fila hacia la izquierda descubre "Eliminar"; el deslizamiento largo borra directamente. |
| `ui/SegmentedControl` | La pastilla se desliza hasta la opción elegida. |
| `ui/CountUp` | Cifras que ruedan hasta su nuevo valor (kg movidos). |
| `LargeTitle` | Título grande que se desvanece en una barra compacta translúcida al desplazar. |
| `BottomNav` | Barra de pestañas persistente en el layout: la pastilla viaja entre pantallas. |
| `workout/NumberField` | Stepper con repetición al mantener pulsado. |

Curvas del sistema en `@theme`: `ease-ios`, `ease-ios-out`, `ease-ios-in` y `ease-spring`. Todo el movimiento se apoya en `transform`/`opacity` y respeta `prefers-reduced-motion`.

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
| `/workout` | Sesión activa (registro de series) |
| `/workout/summary` | Resumen al finalizar |
| `/historial` · `/historial/[id]` | Historial y detalle de sesión |
| `/rutinas` | Gestión de días y ejercicios |
