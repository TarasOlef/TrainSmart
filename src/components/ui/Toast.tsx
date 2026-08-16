"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, CircleAlert } from "lucide-react";
import { cx } from "@/lib/utils";

interface ToastItem {
  id: number;
  message: string;
  kind: "success" | "error";
}

const ToastContext = createContext<{
  toast: (message: string, kind?: ToastItem["kind"]) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const toast = useCallback((message: string, kind: ToastItem["kind"] = "success") => {
    const id = ++counter.current;
    setItems((prev) => [...prev.slice(-2), { id, message, kind }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-6 pb-safe"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cx(
              "flex animate-rise items-center gap-2.5 rounded-full border border-line bg-raised px-4 py-2.5 text-sm font-medium text-ink shadow-lg shadow-black/40",
            )}
          >
            {t.kind === "success" ? (
              <Check className="size-4 text-lime" strokeWidth={3} />
            ) : (
              <CircleAlert className="size-4 text-danger" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx.toast;
}
