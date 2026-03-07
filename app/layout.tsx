import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "ProjectFlow — Manajemen Proyek Tim",
  description: "Platform manajemen proyek internal untuk tim kolaboratif",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
