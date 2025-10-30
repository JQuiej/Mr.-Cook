import { Recipe } from '@/lib/types';
import styles from './page.module.css';

async function getSharedRecipe(code: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/shared-recipes?code=${code}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.recipe;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export default async function SharedRecipePage({
  params,
}: {
  params: { code: string };
}) {
  const sharedRecipe = await getSharedRecipe(params.code);

  if (!sharedRecipe) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Receta no encontrada</h1>
          <p>El enlace que seguiste no es válido o la receta ya no existe.</p>
        </div>
      </div>
    );
  }

  const recipe: Recipe = sharedRecipe.recipe_data;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{recipe.name}</h1>
        <div className={styles.meta}>
          <span className={styles.badge}>{recipe.category}</span>
          <span className={styles.badge}>{recipe.cuisine}</span>
          <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
          <span>👥 {recipe.servings} porciones</span>
        </div>
        <p className={styles.description}>{recipe.description}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Ingredientes</h2>
          <ul className={styles.ingredientsList}>
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                <strong>
                  {ing.amount} {ing.unit}
                </strong>{' '}
                de {ing.name}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <h2>Preparación</h2>
          <ol className={styles.instructionsList}>
            {recipe.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        <div className={styles.times}>
          <div className={styles.timeItem}>
            <span className={styles.timeLabel}>Preparación</span>
            <span className={styles.timeValue}>{recipe.prepTime} min</span>
          </div>
          <div className={styles.timeItem}>
            <span className={styles.timeLabel}>Cocción</span>
            <span className={styles.timeValue}>{recipe.cookTime} min</span>
          </div>
          <div className={styles.timeItem}>
            <span className={styles.timeLabel}>Total</span>
            <span className={styles.timeValue}>
              {recipe.prepTime + recipe.cookTime} min
            </span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p>Vistas: {sharedRecipe.views}</p>
        <a href="/" className={styles.link}>
          Crear mi cuenta en RecipeHub →
        </a>
      </div>
    </div>
  );
}