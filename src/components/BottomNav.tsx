"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, History, NotebookPen } from "lucide-react";
import { cx } from "@/lib/utils";
import { vibrate } from "@/lib/haptics";

const TABS = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/rutinas", label: "Rutinas", icon: NotebookPen },
] as const;

/** ¿Esta ruta pertenece a una pestaña? El entrenamiento va a pantalla completa. */
export function tabForPath(pathname: string): number {
  if (pathname === "/" || pathname.startsWith("/p/")) return 0;
  if (pathname.startsWith("/historial")) return 1;
  if (pathname.startsWith("/rutinas")) return 2;
  return -1;
}

/**
 * Barra de pestañas persistente: vive en el layout, así la pastilla se desliza
 * de una pestaña a otra en vez de reconstruirse en cada pantalla.
 */
export function BottomNav() {
  const pathname = usePathname();
  const index = tabForPath(pathname);
  const hidden = pathname.startsWith("/workout");

  return (
    <nav
      aria-label="Navegación principal"
      aria-hidden={hidden}
      className={cx(
        "fixed inset-x-0 bottom-0 z-40 pb-safe transition-[transform,opacity] duration-[420ms] ease-ios",
        hidden && "pointer-events-none translate-y-[130%] opacity-0",
      )}
    >
      <div className="relative mx-auto mb-3 flex w-[calc(100%-2rem)] max-w-md items-stretch rounded-full border border-line/80 bg-surface/85 p-1.5 shadow-[0_20px_48px_-20px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        <span
          aria-hidden
          className={cx(
            "absolute inset-y-1.5 left-1.5 rounded-full bg-raised transition-[transform,opacity] duration-[420ms] ease-ios",
            index < 0 && "opacity-0",
          )}
          style={{
            width: `calc((100% - 0.75rem) / ${TABS.length})`,
            transform: `translate3d(${Math.max(0, index) * 100}%, 0, 0)`,
          }}
        />

        {TABS.map(({ href, label, icon: Icon }, i) => {
          const active = i === index;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              onClick={() => {
                if (!active) vibrate(8);
              }}
              className={cx(
                "relative z-10 flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[13px] font-medium transition-colors duration-300",
                active ? "text-accent" : "text-faint active:text-dim",
              )}
            >
              <Icon
                className={cx(
                  "size-[19px] transition-transform duration-[420ms] ease-spring",
                  active ? "scale-110" : "scale-100",
                )}
                strokeWidth={active ? 2.25 : 1.75}
              />
              {active && <span className="animate-fade">{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Relleno para que el contenido no quede oculto tras la navegación. */
export function BottomNavSpacer() {
  return <div className="h-24 pb-safe" aria-hidden />;
}
