import { Recipe } from '@/lib/types';
import styles from './page.module.css';
// import { use } from 'react'; // <-- Ya no es necesario
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

// Ya no necesitamos la función getSharedRecipe()

export default async function SharedRecipePage({
  params,
}: {
  // 1. Acepta 'params' como una Promesa, que es lo que Next.js te está enviando
  params: Promise<{ code: string }>;
}) {
  // 2. Resuelve la promesa con 'await'
  const resolvedParams = await params;
  const shareCode = resolvedParams.code;

  let sharedRecipe;

  // 3. Mover la lógica de la API directamente aquí
  try {
    const supabase = await createClient();

    if (!shareCode) {
      return notFound(); // Redirige a la página 404 si el código está vacío
    }

    // 4. Obtener los datos de la receta
    const { data, error } = await supabase
      .from('shared_recipes')
      .select('*')
      .eq('share_code', shareCode)
      .single();

    // 5. Si hay un error o no hay datos, mostrar la página 404
    if (error || !data) {
      return notFound();
    }

    // 6. Incrementar las vistas (esto se hace "sin esperar")
    supabase
      .from('shared_recipes')
      .update({ views: data.views + 1 })
      .eq('id', data.id)
      .then(); // .then() vacío "dispara y olvida" la promesa

    sharedRecipe = data; // Asignar los datos a nuestra variable

  } catch (error) {
    console.error('Error obteniendo receta compartida:', error);
    // Un error genérico si la base de datos falla
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Error del servidor</h1>
          <p>No se pudo cargar la receta. Inténtalo de nuevo más tarde.</p>
        </div>
      </div>
    );
  }
  
  // 7. Renderizar la receta
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
          Crear mi cuenta en Mr. Cook →
        </a>
      </div>
    </div>
  );
}