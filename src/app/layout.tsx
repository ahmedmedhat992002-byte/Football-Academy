import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { RouteProgressProvider } from "@/components/layout/route-progress-provider";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FIFA FC ACADEMY | أكاديمية كرة القدم الاحترافية",
    template: "%s | FIFA FC ACADEMY",
  },
  description: "FIFA FC ACADEMY — صناعة وتطوير مواهب ونجوم كرة القدم وفق أعلى المعايير الدولية الاحترافية",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-black">
        <RouteProgressProvider>
          {children}
        </RouteProgressProvider>
      </body>
    </html>
  );
}
