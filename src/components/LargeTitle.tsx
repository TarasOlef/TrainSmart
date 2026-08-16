"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Cabecera de iOS con título grande: al desplazar, el titular se desvanece y
 * aparece la barra compacta translúcida con el mismo nombre. La barra va fija,
 * no pegajosa, para no robar altura cuando la lista está arriba del todo.
 */
export function LargeTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  const [t, setT] = useState(0);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const y = window.scrollY;
      setT(Math.min(1, Math.max(0, (y - 16) / 40)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden={t < 0.5}
        style={{ opacity: t }}
        className="pointer-events-none fixed inset-x-0 top-0 z-30 mx-auto max-w-md pt-safe"
      >
        <div className="flex h-12 items-center justify-center bg-bg/80 px-4 backdrop-blur-xl">
          <span className="truncate text-[15px] font-semibold">{title}</span>
          {action && (
            <div className="pointer-events-auto absolute right-4">{action}</div>
          )}
        </div>
        <div className="hairline" />
      </div>

      <div
        className="flex items-end justify-between pt-8"
        style={{ opacity: 1 - t, transform: `translate3d(0, ${t * -8}px, 0)` }}
      >
        <h1 className="font-display text-[34px] font-extrabold leading-none tracking-tight">
          {title}
        </h1>
        {action}
      </div>
    </>
  );
}
