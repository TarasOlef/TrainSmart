import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import { WorkoutProvider } from "@/lib/workout-store";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const appFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-app",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrainSmart",
  description: "Tu libreta de entrenamiento. Pesos, series y repeticiones sin fricción.",
  applicationName: "TrainSmart",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TrainSmart",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={appFont.variable}>
      <body>
        <ToastProvider>
          <WorkoutProvider>
            {/* Contenedor tipo app: ancho móvil también en escritorio */}
            <div className="mx-auto min-h-dvh w-full max-w-md">{children}</div>
          </WorkoutProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
