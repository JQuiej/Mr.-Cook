'use client';

import { useState } from 'react';
import { Recipe } from '@/lib/types';
import CookingMode from '@/components/CookingMode';
import ShareRecipe from '@/components/ShareRecipe';
import ServingsAdjuster from '@/components/Servingsadjuster';
import RecipeNotes from '@/components/Recipenotes';
import styles from './recipes.module.css';
import { toast } from 'sonner';

export default function RecipesPage() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [category, setCategory] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [diet, setDiet] = useState('');
  const [difficulty, setDifficulty] = useState('');
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
        body: JSON.stringify({
          ingredients,
          category,
          cuisine,
          diet,
          difficulty,
        }),
      });
      const data = await response.json();
      const fetchedRecipes = data.recipes || [];
      setRecipes(fetchedRecipes);
      setAdjustedRecipes({});
    } catch (error) {
      console.error('Error buscando recetas:', error);
      toast.error('Error al buscar recetas');
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
      toast.success('Receta agregada a favoritas');
    } catch (error) {
      console.error('Error agregando a favoritas:', error);
      toast.error('Error al agregar a favoritas');
    }
  };

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

  const openCalendarModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
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
      toast.success('Receta agregada al calendario');
      setShowCalendarModal(false);
      setSelectedDate('');
      setSelectedRecipe(null);
    } catch (error) {
      console.error('Error agregando al calendario:', error);
      toast.error('Error al agregar al calendario');
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
      {/* PANTALLA DE CARGA */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <h2>🍳 Generando tus recetas...</h2>
            <p>Esto puede tomar unos segundos</p>
            <div className={styles.loadingSteps}>
              <div className={styles.step}>✓ Analizando ingredientes</div>
              <div className={styles.step}>✓ Buscando recetas perfectas</div>
              <div className={styles.step}>⏳ Generando imágenes...</div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <h1>      Buscar Recetas</h1>

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

            <div className={styles.selectWrapper}>
              <label>Dieta</label>
              <select value={diet} onChange={(e) => setDiet(e.target.value)}>
                <option value="">Cualquiera</option>
                <option value="vegana">Vegana</option>
                <option value="vegetariana">Vegetariana</option>
                <option value="sin gluten">Sin Gluten</option>
              </select>
            </div>

            <div className={styles.selectWrapper}>
              <label>Dificultad</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="">Cualquiera</option>
                <option value="fácil">Fácil</option>
                <option value="media">Media</option>
                <option value="difícil">Difícil</option>
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
                {displayRecipe.imageUrl && (
                  <div className={styles.imageContainer}>
                    <img
                      src={displayRecipe.imageUrl}
                      alt={displayRecipe.name}
                      className={styles.recipeImage}
                    />
                  </div>
                )}

                <h2>{displayRecipe.name}</h2>
                <p className={styles.description}>{displayRecipe.description}</p>

                <div className={styles.meta}>
                  <span className={styles.badge}>{displayRecipe.category}</span>
                  <span className={styles.badge}>{displayRecipe.cuisine}</span>
                  <span>⏱️ {displayRecipe.prepTime + displayRecipe.cookTime} min</span>
                  {displayRecipe.difficulty && (
                    <span className={styles.badge}>{displayRecipe.difficulty}</span>
                  )}
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
                  <button onClick={() => setCookingModeRecipe(displayRecipe)} className={styles.cookBtn}>
                    👨‍🍳 Modo Cocina
                  </button>
                  <button onClick={() => addToFavorites(displayRecipe)} className={styles.favoriteBtn}>
                    ⭐ Favorita
                  </button>
                  <button onClick={() => openCalendarModal(displayRecipe)} className={styles.calendarBtn}>
                    📅 Calendario
                  </button>
                  <button onClick={() => addToShoppingList(displayRecipe)} className={styles.shoppingBtn}>
                    🛒 Lista
                  </button>
                  <button onClick={() => setShareRecipe(displayRecipe)} className={styles.shareBtn}>
                    📤 Compartir
                  </button>
                </div>

                <RecipeNotes recipeId={`${recipe.name}-${i}`} />
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
                min={new Date().toISOString().split('T')[0]}
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
                    setSelectedRecipe(null);
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
        <CookingMode recipe={cookingModeRecipe} onClose={() => setCookingModeRecipe(null)} />
      )}

      {shareRecipe && <ShareRecipe recipe={shareRecipe} onClose={() => setShareRecipe(null)} />}
    </>
  );
}