'use client';

import { useState, useEffect } from 'react';
import { Recipe } from '@/lib/types';
import styles from './favorites.module.css';
import { toast } from 'sonner';
import ShareRecipe from '@/components/ShareRecipe';
import Image from 'next/image'; // <-- 1. Importar Image

interface Favorite {
  id: string;
  recipe_name: string;
  recipe_data: Recipe;
  created_at: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [shareRecipe, setShareRecipe] = useState<Recipe | null>(null);

  // --- NUEVOS ESTADOS PARA EL MODAL DE CALENDARIO ---
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [recipeForCalendar, setRecipeForCalendar] = useState<Recipe | null>(null);
  // --- FIN DE NUEVOS ESTADOS ---

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Error cargando favoritas:', error);
      toast.error('Error al cargar las favoritas');
    }
    setLoading(false);
  };

  const removeFavorite = (id: string) => {
    // if (!confirm('¿Eliminar esta receta de favoritas?')) return; // <-- Eliminado

    toast.warning('¿Eliminar esta receta de favoritas?', {
      action: {
        label: 'Eliminar',
        onClick: async () => {
          // Lógica de borrado dentro del onClick del toast
          try {
            await fetch(`/api/favorites?id=${id}`, { method: 'DELETE' });
            // Usar set-state funcional para asegurar el estado más reciente
            setFavorites((prevFavorites) =>
              prevFavorites.filter((f) => f.id !== id)
            );
            toast.success('Receta eliminada de favoritas');
          } catch (error) {
            console.error('Error eliminando favorita:', error);
            toast.error('Error al eliminar la favorita');
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => toast.dismiss(), // Cierra el toast
      },
    });
  };
  const addToCalendar = async () => {
    // const date = prompt('Fecha (YYYY-MM-DD):'); (Línea eliminada)
    if (!selectedDate || !recipeForCalendar) return; // Validar con estado

    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeData: recipeForCalendar, // Usar estado
          date: selectedDate, // Usar estado
        }),
      });
      toast.success('Agregada al calendario');
      // Limpiar y cerrar modal
      setShowCalendarModal(false);
      setSelectedDate('');
      setRecipeForCalendar(null);
    } catch (error) {
      console.error('Error agregando al calendario:', error);
      toast.error('Error al agregar al calendario');
    }
  };

  const openCalendarModal = (recipe: Recipe) => {
    setRecipeForCalendar(recipe);
    // Poner la fecha de mañana por defecto
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    setShowCalendarModal(true);
  };

  // --- FUNCIÓN AÑADIDA: addToShoppingList ---
const addToShoppingList = async (recipe: Recipe) => {
  try {
    const response = await fetch('/api/shopping-lists');
    const data = await response.json();

    // Crear items con el nombre de la receta como categoría
    const newItems = recipe.ingredients.map((ing) => ({
      id: Date.now().toString() + Math.random(),
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      checked: false,
      recipeSource: recipe.name, // Identificador de receta
    }));

    if (data.lists && data.lists.length > 0) {
      // Agregar a lista existente
      await fetch('/api/shopping-lists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.lists[0].id,
          name: data.lists[0].name,
          items: [...data.lists[0].items, ...newItems],
        }),
      });
    } else {
      // Crear nueva lista
      await fetch('/api/shopping-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Mi Lista de Compras',
          items: newItems,
        }),
      });
    }

    toast.success(`Ingredientes de "${recipe.name}" agregados`);
  } catch (error) {
    console.error('Error:', error);
    toast.error('Error al agregar a la lista');
  }
};

  // --- FIN DE LA FUNCIÓN AÑADIDA ---

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>      Mis Recetas Favoritas</h1>

      {favorites.length === 0 ? (
        <div className={styles.empty}>
          <p>Aún no tienes recetas favoritas</p>
          <a href="/dashboard/recipes">Buscar recetas</a>
        </div>
      ) : (
        <div className={styles.grid}>
          {favorites.map((favorite) => (
            <div key={favorite.id} className={styles.card}>
              {/* --- 2. AÑADIR BLOQUE DE IMAGEN --- */}
              {favorite.recipe_data.imageUrl && (
                <div className={styles.recipeImageContainer}>
                  <Image
                    src={favorite.recipe_data.imageUrl}
                    alt={favorite.recipe_data.name}
                    width={400}
                    height={250}
                    className={styles.recipeImage}
                  />
                </div>
              )}
              {/* --- FIN DE BLOQUE DE IMAGEN --- */}

              <h2>{favorite.recipe_data.name}</h2>
              <p className={styles.description}>
                {favorite.recipe_data.description}
              </p>

              <div className={styles.meta}>
                <span className={styles.badge}>
                  {favorite.recipe_data.category}
                </span>
                <span className={styles.badge}>
                  {favorite.recipe_data.cuisine}
                </span>
                <span>
                  ⏱️{' '}
                  {favorite.recipe_data.prepTime +
                    favorite.recipe_data.cookTime}{' '}
                  min
                </span>
              </div>

              <div className={styles.actions}>
                <button
                  onClick={() => setSelectedRecipe(favorite.recipe_data)}
                  className={styles.viewBtn}
                >
                  Ver Detalles
                </button>
                <button
                  onClick={() => openCalendarModal(favorite.recipe_data)}
                  className={styles.calendarBtn}
                >
                  📅
                </button>
                
                {/* --- BOTÓN AÑADIDO --- */}
                <button
                  onClick={() => addToShoppingList(favorite.recipe_data)}
                  className={styles.shoppingBtn}
                >
                  🛒
                </button>
                {/* --- FIN DE BOTÓN AÑADIDO --- */}

                <button
                  onClick={() => setShareRecipe(favorite.recipe_data)}
                  className={styles.shareBtn}
                >
                  📤 Compartir
                </button>
                <button
                  onClick={() => removeFavorite(favorite.id)}
                  className={styles.deleteBtn}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRecipe && (
        <div
          className={styles.modal}
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRecipe(null)}
              className={styles.closeBtn}
            >
              ×
            </button>

            {/* --- 3. AÑADIR IMAGEN AL MODAL --- */}
            {selectedRecipe.imageUrl && (
              <div className={styles.modalImageContainer}>
                <Image
                  src={selectedRecipe.imageUrl}
                  alt={selectedRecipe.name}
                  width={600}
                  height={400}
                  className={styles.modalImage}
                />
              </div>
            )}
            {/* --- FIN DE IMAGEN AL MODAL --- */}

            <h2>{selectedRecipe.name}</h2>
            <p className={styles.description}>{selectedRecipe.description}</p>

            <div className={styles.ingredients}>
              <h3>Ingredientes</h3>
              <ul>
                {selectedRecipe.ingredients.map((ing, i) => (
                  <li key={i}>
                    {ing.amount} {ing.unit} de {ing.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.instructions}>
              <h3>Preparación</h3>
              <ol>
                {selectedRecipe.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <div className={styles.modalMeta}>
              <span>Tiempo de prep: {selectedRecipe.prepTime} min</span>
              <span>Tiempo de cocción: {selectedRecipe.cookTime} min</span>
              <span>Porciones: {selectedRecipe.servings}</span>
            </div>
          </div>
        </div>
      )}
      {showCalendarModal && (
        <div
          className={styles.modal}
          onClick={() => setShowCalendarModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCalendarModal(false)}
              className={styles.closeBtn}
            >
              ×
            </button>
            <h2>Agregar al Calendario</h2>
            <p>Selecciona la fecha para: {recipeForCalendar?.name}</p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Evitar fechas pasadas
              className={styles.dateInput} // Necesita estilos (ver paso sig.)
            />
            <div className={styles.modalActions}>
              <button onClick={addToCalendar} className={styles.confirmBtn}>
                Confirmar
              </button>
              <button
                onClick={() => setShowCalendarModal(false)}
                className={styles.cancelBtn}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {shareRecipe && (
        <ShareRecipe
          recipe={shareRecipe}
          onClose={() => setShareRecipe(null)}
        />
      )}
    </div>
  );
}