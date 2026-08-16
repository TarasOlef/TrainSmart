"use client";

/**
 * Transición entre pantallas. Solo opacidad: cualquier transform aquí
 * reposicionaría los elementos fijos (barra de pestañas, panel del
 * entrenamiento) durante la animación.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
