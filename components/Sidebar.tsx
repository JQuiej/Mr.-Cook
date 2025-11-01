'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useState } from 'react'; // <-- 1. Importar useState

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <-- 2. Añadir estado

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { href: '/dashboard', label: 'Inicio', icon: '🏠' },
    { href: '/dashboard/recipes', label: 'Buscar Recetas', icon: '🍳' },
    { href: '/dashboard/favorites', label: 'Favoritas', icon: '⭐' },
    { href: '/dashboard/calendar', label: 'Calendario', icon: '📅' },
    { href: '/dashboard/shopping', label: 'Lista de Compras', icon: '🛒' },
    { href: '/dashboard/history', label: 'Historial', icon: '🕓' },
  ];

  return (
    <>
      {/* --- 3. Botón de Hamburguesa (solo visible en móvil) --- */}
      <button
        className={styles.mobileMenuButton}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Abrir menú"
      >
        {isMobileMenuOpen ? '×' : '☰'}
      </button>

      {/* --- 4. Overlay (fondo oscuro) --- */}
      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={closeMobileMenu}></div>
      )}

      {/* --- 5. Añadir clase condicional al Sidebar --- */}
      <aside
        className={`${styles.sidebar} ${
          isMobileMenuOpen ? styles.mobileOpen : ''
        }`}
      >
        <div className={styles.logo}>
          <h2>Mr. Cook</h2>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${
                pathname === item.href ? styles.active : ''
              }`}
              onClick={closeMobileMenu} // <-- 6. Cerrar al hacer clic en un ítem
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.footer}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}