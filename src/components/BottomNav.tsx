"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, History, NotebookPen } from "lucide-react";
import { cx } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/rutinas", label: "Rutinas", icon: NotebookPen },
] as const;

/** Navegación flotante: solo la pestaña activa se nombra. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 pb-safe"
    >
      <div className="mx-auto mb-3 flex w-[calc(100%-2rem)] max-w-md items-stretch gap-1 rounded-full border border-line/80 bg-surface/85 p-1.5 shadow-[0_20px_48px_-20px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[13px] font-medium transition-colors duration-200",
                active
                  ? "bg-raised text-accent"
                  : "text-faint active:text-dim",
              )}
            >
              <Icon className="size-[19px]" strokeWidth={active ? 2.25 : 1.75} />
              {active && label}
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
