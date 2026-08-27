import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pátio Livre | Espaços para cães em São Paulo",
  description: "Encontre quintais, jardins e áreas cercadas para passear, brincar e treinar com seu cão em São Paulo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
