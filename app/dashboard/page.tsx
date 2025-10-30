import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Bienvenido de vuelta</h1>
        <p>Descubre nuevas recetas o revisa tus favoritas</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Buscar Recetas</h3>
          <p>Encuentra recetas según tus ingredientes y preferencias</p>
          <a href="/dashboard/recipes" className={styles.cardLink}>
            Explorar →
          </a>
        </div>

        <div className={styles.card}>
          <h3>Mis Favoritas</h3>
          <p>Accede rápidamente a tus recetas guardadas</p>
          <a href="/dashboard/favorites" className={styles.cardLink}>
            Ver →
          </a>
        </div>

        <div className={styles.card}>
          <h3>Calendario</h3>
          <p>Planifica tus comidas de la semana</p>
          <a href="/dashboard/calendar" className={styles.cardLink}>
            Planificar →
          </a>
        </div>
      </div>
    </div>
  );
}