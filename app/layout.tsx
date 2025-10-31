// app/layout.tsx
import type { Metadata } from 'next';
import '../styles/globals.css';
import { Toaster } from 'sonner'; // <-- 1. Importar

export const metadata: Metadata = {
  title: 'Mr. Cook - Descubre recetas increíbles',
  description: 'Encuentra y guarda tus recetas favoritas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {/* 2. Añadir el Toaster aquí. 'richColors' usa colores por defecto para éxito, error, etc. */}
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}