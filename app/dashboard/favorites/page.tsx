'use client';

import { useState, useEffect } from 'react';
import { Recipe } from '@/lib/types';
import styles from './favorites.module.css';

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
    }
    setLoading(false);
  };

  const removeFavorite = async (id: string) => {
    if (!confirm('¿Eliminar esta receta de favoritas?')) return;

    try {
      await fetch(`/api/favorites?id=${id}`, { method: 'DELETE' });
      setFavorites(favorites.filter((f) => f.id !== id));
    } catch (error) {
      console.error('Error eliminando favorita:', error);
    }
  };

  const addToCalendar = async (recipe: Recipe) => {
    const date = prompt('Fecha (YYYY-MM-DD):');
    if (!date) return;

    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeData: recipe, date }),
      });
      alert('Agregada al calendario');
    } catch (error) {
      console.error('Error agregando al calendario:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Mis Recetas Favoritas</h1>

      {favorites.length === 0 ? (
        <div className={styles.empty}>
          <p>Aún no tienes recetas favoritas</p>
          <a href="/dashboard/recipes">Buscar recetas</a>
        </div>
      ) : (
        <div className={styles.grid}>
          {favorites.map((favorite) => (
            <div key={favorite.id} className={styles.card}>
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
                  onClick={() => addToCalendar(favorite.recipe_data)}
                  className={styles.calendarBtn}
                >
                  📅
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
    </div>
  );
}