'use client';

import { useState, useEffect } from 'react';
import { SearchHistory } from '@/lib/types';
import { Recipe } from '@/lib/types';
import styles from './history.module.css';

export default function HistoryPage() {
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/search-history');
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
    setLoading(false);
  };

  const deleteHistoryItem = async (id: string) => {
    if (!confirm('¿Eliminar esta búsqueda del historial?')) return;

    try {
      await fetch(`/api/search-history?id=${id}`, { method: 'DELETE' });
      setHistory(history.filter((h) => h.id !== id));
    } catch (error) {
      console.error('Error eliminando del historial:', error);
    }
  };

  const addToFavorites = async (recipe: Recipe) => {
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeName: recipe.name,
          recipeData: recipe,
        }),
      });
      alert('Receta agregada a favoritas');
    } catch (error) {
      console.error('Error agregando a favoritas:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Historial de Búsquedas</h1>

      {history.length === 0 ? (
        <div className={styles.empty}>
          <p>No tienes búsquedas en el historial</p>
          <a href="/dashboard/recipes">Buscar recetas</a>
        </div>
      ) : (
        <div className={styles.historyList}>
          {history.map((item) => (
            <div key={item.id} className={styles.historyItem}>
              <div className={styles.historyHeader}>
                <div className={styles.searchInfo}>
                  <h3>Búsqueda del {formatDate(item.created_at)}</h3>
                  <div className={styles.filters}>
                    {item.ingredients && item.ingredients.length > 0 && (
                      <span className={styles.filterTag}>
                        Ingredientes: {item.ingredients.join(', ')}
                      </span>
                    )}
                    {item.category && (
                      <span className={styles.filterTag}>
                        Categoría: {item.category}
                      </span>
                    )}
                    {item.cuisine && (
                      <span className={styles.filterTag}>
                        Cocina: {item.cuisine}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  className={styles.deleteBtn}
                >
                  🗑️
                </button>
              </div>

              <div className={styles.recipesGrid}>
                {item.recipes_data.map((recipe, idx) => (
                  <div key={idx} className={styles.recipeCard}>
                    <h4>{recipe.name}</h4>
                    <p className={styles.description}>{recipe.description}</p>
                    <div className={styles.meta}>
                      <span className={styles.badge}>{recipe.category}</span>
                      <span className={styles.badge}>{recipe.cuisine}</span>
                      <span>
                        ⏱️ {recipe.prepTime + recipe.cookTime} min
                      </span>
                    </div>
                    <div className={styles.actions}>
                      <button
                        onClick={() => setSelectedRecipe(recipe)}
                        className={styles.viewBtn}
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => addToFavorites(recipe)}
                        className={styles.favoriteBtn}
                      >
                        ⭐
                      </button>
                    </div>
                  </div>
                ))}
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