import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pátio Livre | Espaços para cães em São Paulo",
  description: "Descubra espaços ilustrativos e manifeste interesse em novos lugares para cães.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
