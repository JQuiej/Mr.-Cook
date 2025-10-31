import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import styles from './page.module.css';
import { CalendarEvent, ShoppingList } from '@/lib/types'; // Importar tipos
import Link from 'next/link'; // Usar Link en lugar de <a>

// Función para formatear la fecha (ej: "vie, 31 oct")
function formatDate(dateString: string) {
  const date = new Date(dateString);
  // Ajustar por zona horaria (Supabase suele guardar en UTC)
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() + userTimezoneOffset);

  return localDate.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // --- OBTENER DATOS PARA EL RESUMEN ---
  const today = new Date().toISOString().split('T')[0];
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeek = nextWeekDate.toISOString().split('T')[0];

  // Consultas en paralelo
  const [calendarData, shoppingData, favoritesData] = await Promise.all([
    // 1. Próximas 5 recetas en el calendario
    supabase
      .from('calendar_events')
      .select('id, recipe_data, date')
      .eq('user_id', user.id)
      .gte('date', today)
      .lte('date', nextWeek)
      .not('recipe_data', 'is', null) // <-- AÑADE ESTO
      .order('date', { ascending: true })
      .limit(5),
    
    // 2. Listas de compras (para contar items pendientes)
    supabase
      .from('shopping_lists')
      .select('items')
      .eq('user_id', user.id),
    
    // 3. Conteo de recetas favoritas
    supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
  ]);

  // Procesar los resultados
  const upcomingRecipes: CalendarEvent[] = (calendarData.data as unknown as CalendarEvent[]) || [];
  
  const pendingItemsCount = shoppingData.data
    ? (shoppingData.data as ShoppingList[]).reduce((acc, list) => {
        const uncheckedItems = list.items.filter(item => !item.checked).length;
        return acc + uncheckedItems;
      }, 0)
    : 0;
  
  const favoritesCount = favoritesData.count || 0;
  // --- FIN DE OBTENER DATOS ---

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Bienvenido de vuelta</h1>
        <p>Este es tu resumen semanal y accesos rápidos</p>
      </header>

      {/* --- NUEVA SECCIÓN DE RESUMEN --- */}
      <h2 className={styles.summaryTitle}>Tu Resumen</h2>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <h3>Próximas Recetas</h3>
          {upcomingRecipes.length > 0 ? (
            <ul className={styles.summaryList}>
              {upcomingRecipes
                .filter(event => event.recipeData?.name)
                .map((event) => (
                  <li key={event.id} className={styles.summaryItem}>
                    <span className={styles.summaryItemDate}>
                      {formatDate(event.date)}
                    </span>
                    <span className={styles.summaryItemName}>
                      {event.recipeData.name}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className={styles.emptySummary}>
              No tienes recetas planificadas para esta semana.
            </p>
          )}
          <Link href="/dashboard/calendar" className={styles.cardLink}>
            Ir al Calendario →
          </Link>
        </div>

        <div className={styles.summaryCard}>
          <h3>Compras Pendientes</h3>
          <div className={styles.shoppingSummary}>
            <span className={styles.shoppingCount}>{pendingItemsCount}</span>
            <p>
              {pendingItemsCount === 1
                ? 'item pendiente'
                : 'items pendientes'}
            </p>
          </div>
          <Link href="/dashboard/shopping" className={styles.cardLink}>
            Ver mi Lista →
          </Link>
        </div>
      </div>
      {/* --- FIN DE SECCIÓN DE RESUMEN --- */}


      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Buscar Recetas</h3>
          <p>Encuentra recetas según tus ingredientes y preferencias</p>
          <Link href="/dashboard/recipes" className={styles.cardLink}>
            Explorar →
          </Link>
        </div>

        <div className={styles.card}>
          {/* Tarjeta de Favoritas modificada con conteo */}
          <div className={styles.cardHeader}>
            <h3>Mis Favoritas</h3>
            <span className={styles.summaryCount}>{favoritesCount}</span>
          </div>
          <p>Accede rápidamente a tus recetas guardadas</p>
          <Link href="/dashboard/favorites" className={styles.cardLink}>
            Ver →
          </Link>
        </div>

        <div className={styles.card}>
          <h3>Calendario</h3>
          <p>Planifica tus comidas de la semana</p>
          <Link href="/dashboard/calendar" className={styles.cardLink}>
            Planificar →
          </Link>
        </div>

        {/* Nueva tarjeta de Lista de Compras */}
        <div className={styles.card}>
          <h3>Lista de Compras</h3>
          <p>Organiza los ingredientes que necesitas comprar</p>
          <Link href="/dashboard/shopping" className={styles.cardLink}>
            Ir a la Lista →
          </Link>
        </div>

      </div>
    </div>
  );
}