import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist_Mono, Instrument_Sans } from "next/font/google";
import { WorkoutProvider } from "@/lib/workout-store";
import { ToastProvider } from "@/components/ui/Toast";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

/* Tres voces: titulares con carácter, texto neutro y cifras de libreta. */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
  themeColor: "#0d1311",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <ToastProvider>
          <WorkoutProvider>
            {/* Contenedor tipo app: ancho móvil también en escritorio */}
            <div className="mx-auto min-h-dvh w-full max-w-md">{children}</div>
            {/* La barra vive fuera de las páginas: así se desliza entre ellas */}
            <BottomNav />
          </WorkoutProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
