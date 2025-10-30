'use client';

import { useState } from 'react';
import { Recipe } from '@/lib/types';
import CookingMode from '@/components/CookingMode';
import ShareRecipe from '@/components/ShareRecipe';
import ServingsAdjuster from '@/components/Servingsadjuster';
import RecipeNotes from '@/components/Recipenotes';
import styles from './recipes.module.css';

export default function RecipesPage() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [category, setCategory] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [cookingModeRecipe, setCookingModeRecipe] = useState<Recipe | null>(null);
  const [shareRecipe, setShareRecipe] = useState<Recipe | null>(null);
  const [adjustedRecipes, setAdjustedRecipes] = useState<{ [key: number]: Recipe }>({});

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const searchRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, category, cuisine }),
      });
      const data = await response.json();
      const fetchedRecipes = data.recipes || [];
      setRecipes(fetchedRecipes);
      setAdjustedRecipes({});

      // Guardar en historial
      if (fetchedRecipes.length > 0) {
        await fetch('/api/search-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ingredients,
            category,
            cuisine,
            recipes: fetchedRecipes,
          }),
        });
      }
    } catch (error) {
      console.error('Error buscando recetas:', error);
    }
    setLoading(false);
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

  const addToShoppingList = async (recipe: Recipe) => {
    try {
      // Obtener listas existentes
      const response = await fetch('/api/shopping-lists');
      const data = await response.json();
      let listId = null;

      if (data.lists && data.lists.length > 0) {
        // Agregar a la primera lista
        listId = data.lists[0].id;
        const currentItems = data.lists[0].items;
        const newItems = recipe.ingredients.map((ing) => ({
          id: Date.now().toString() + Math.random(),
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          checked: false,
          recipeSource: recipe.name,
        }));

        await fetch('/api/shopping-lists', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: listId,
            name: data.lists[0].name,
            items: [...currentItems, ...newItems],
          }),
        });
      } else {
        // Crear nueva lista
        const newItems = recipe.ingredients.map((ing) => ({
          id: Date.now().toString() + Math.random(),
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          checked: false,
          recipeSource: recipe.name,
        }));

        await fetch('/api/shopping-lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Mi Lista',
            items: newItems,
          }),
        });
      }

      alert('Ingredientes agregados a la lista de compras');
    } catch (error) {
      console.error('Error agregando a lista de compras:', error);
    }
  };

  const openCalendarModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowCalendarModal(true);
  };

  const addToCalendar = async () => {
    if (!selectedRecipe || !selectedDate) return;

    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeData: selectedRecipe,
          date: selectedDate,
        }),
      });
      alert('Receta agregada al calendario');
      setShowCalendarModal(false);
      setSelectedDate('');
    } catch (error) {
      console.error('Error agregando al calendario:', error);
    }
  };

  const handleServingsAdjust = (index: number, adjustedRecipe: Recipe) => {
    setAdjustedRecipes({ ...adjustedRecipes, [index]: adjustedRecipe });
  };

  const getDisplayRecipe = (index: number, originalRecipe: Recipe) => {
    return adjustedRecipes[index] || originalRecipe;
  };

  return (
    <>
      <div className={styles.container}>
        <h1>Buscar Recetas</h1>

        <div className={styles.filters}>
          <div className={styles.ingredientsSection}>
            <label>Ingredientes (opcional)</label>
            <div className={styles.ingredientInput}>
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="Agregar ingrediente"
              />
              <button onClick={addIngredient} className={styles.addBtn}>
                Agregar
              </button>
            </div>
            <div className={styles.ingredientList}>
              {ingredients.map((ing, i) => (
                <span key={i} className={styles.ingredientTag}>
                  {ing}
                  <button onClick={() => removeIngredient(i)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className={styles.selectGroup}>
            <div className={styles.selectWrapper}>
              <label>Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Todas</option>
                <option value="desayuno">Desayuno</option>
                <option value="almuerzo">Almuerzo</option>
                <option value="cena">Cena</option>
                <option value="postre">Postre</option>
              </select>
            </div>

            <div className={styles.selectWrapper}>
              <label>Tipo de Cocina</label>
              <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                <option value="">Todas</option>
                <option value="mexicana">Mexicana</option>
                <option value="italiana">Italiana</option>
                <option value="guatemalteca">Guatemalteca</option>
                <option value="española">Española</option>
                <option value="asiática">Asiática</option>
                <option value="americana">Americana</option>
              </select>
            </div>
          </div>

          <button onClick={searchRecipes} disabled={loading} className={styles.searchBtn}>
            {loading ? 'Buscando...' : 'Buscar Recetas'}
          </button>
        </div>

        <div className={styles.recipes}>
          {recipes.map((recipe, i) => {
            const displayRecipe = getDisplayRecipe(i, recipe);
            return (
              <div key={i} className={styles.recipeCard}>
                <h2>{displayRecipe.name}</h2>
                <p className={styles.description}>{displayRecipe.description}</p>

                <div className={styles.meta}>
                  <span className={styles.badge}>{displayRecipe.category}</span>
                  <span className={styles.badge}>{displayRecipe.cuisine}</span>
                  <span>⏱️ {displayRecipe.prepTime + displayRecipe.cookTime} min</span>
                </div>

                <ServingsAdjuster
                  recipe={recipe}
                  onAdjust={(adjusted) => handleServingsAdjust(i, adjusted)}
                />

                <div className={styles.ingredients}>
                  <h3>Ingredientes</h3>
                  <ul>
                    {displayRecipe.ingredients.map((ing, j) => (
                      <li key={j}>
                        {ing.amount} {ing.unit} de {ing.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.instructions}>
                  <h3>Preparación</h3>
                  <ol>
                    {displayRecipe.instructions.map((step, j) => (
                      <li key={j}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className={styles.actions}>
                  <button
                    onClick={() => setCookingModeRecipe(displayRecipe)}
                    className={styles.cookBtn}
                  >
                    👨‍🍳 Modo Cocina
                  </button>
                  <button
                    onClick={() => addToFavorites(displayRecipe)}
                    className={styles.favoriteBtn}
                  >
                    ⭐ Favorita
                  </button>
                  <button
                    onClick={() => openCalendarModal(displayRecipe)}
                    className={styles.calendarBtn}
                  >
                    📅 Calendario
                  </button>
                  <button
                    onClick={() => addToShoppingList(displayRecipe)}
                    className={styles.shoppingBtn}
                  >
                    🛒 Lista
                  </button>
                  <button
                    onClick={() => setShareRecipe(displayRecipe)}
                    className={styles.shareBtn}
                  >
                    📤 Compartir
                  </button>
                </div>

                <RecipeNotes
                  recipeId={`${recipe.name}-${i}`}
                />
              </div>
            );
          })}
        </div>

        {showCalendarModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Agregar al Calendario</h2>
              <p>Selecciona la fecha para: {selectedRecipe?.name}</p>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={styles.dateInput}
              />
              <div className={styles.modalActions}>
                <button onClick={addToCalendar} className={styles.confirmBtn}>
                  Confirmar
                </button>
                <button
                  onClick={() => {
                    setShowCalendarModal(false);
                    setSelectedDate('');
                  }}
                  className={styles.cancelBtn}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {cookingModeRecipe && (
        <CookingMode
          recipe={cookingModeRecipe}
          onClose={() => setCookingModeRecipe(null)}
        />
      )}

      {shareRecipe && (
        <ShareRecipe recipe={shareRecipe} onClose={() => setShareRecipe(null)} />
      )}
    </>
  );
}