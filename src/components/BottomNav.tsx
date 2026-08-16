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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-md items-stretch pb-safe">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-150",
                active ? "text-lime" : "text-faint active:text-dim",
              )}
            >
              <Icon className="size-[22px]" strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Relleno para que el contenido no quede oculto tras la navegación. */
export function BottomNavSpacer() {
  return <div className="h-16 pb-safe" aria-hidden />;
}
