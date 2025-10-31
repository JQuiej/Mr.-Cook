import { Recipe } from './types';

// Función helper para no repetir el código de fetch
async function attemptFetch(url: string, headers: HeadersInit): Promise<string | null> {
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.warn(`Unsplash query falló: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
    return null;
  } catch (error) {
    console.error(`Error en fetch de Unsplash:`, error);
    return null;
  }
}

export async function getPhotoForRecipe(recipe: Recipe): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!accessKey) {
    console.error('UNSPLASH_ACCESS_KEY no está configurada.');
    return null;
  }

  const headers = { Authorization: `Client-ID ${accessKey}` };
  
  // --- CORRECCIÓN CRÍTICA ---
  // Esta es la URL base como una cadena de texto simple, 
  // sin el formato Markdown que causaba el error.
  const baseApiUrl = 'https://api.unsplash.com/search/photos?per_page=1&orientation=landscape';
  // --- FIN DE LA CORRECCIÓN ---

  // Intento 1: Nombre exacto (entre comillas) + Cocina + "food"
  // Esta es la búsqueda más precisa.
  // Ej: "Rellenitos de Plátano" guatemalteca food
  let query = `"${recipe.name}" ${recipe.cuisine} food`;
  console.log(`Buscando (Intento 1): ${query}`); // Log para debugging
  let imageUrl = await attemptFetch(`${baseApiUrl}&query=${encodeURIComponent(query)}`, headers);
  if (imageUrl) return imageUrl;

  // Intento 2: Nombre exacto (entre comillas) + "food"
  // Si la cocina lo hizo muy específico
  console.warn(`Intento 1 falló para "${query}". Probando fallback 1...`);
  query = `"${recipe.name}" food`;
  console.log(`Buscando (Intento 2): ${query}`); // Log para debugging
  imageUrl = await attemptFetch(`${baseApiUrl}&query=${encodeURIComponent(query)}`, headers);
  if (imageUrl) return imageUrl;

  // Intento 3: Solo el nombre (sin comillas) + "food"
  // La búsqueda más amplia.
  console.warn(`Intento 2 falló para "${query}". Probando fallback 2...`);
  query = `${recipe.name} food`;
  console.log(`Buscando (Intento 3): ${query}`); // Log para debugging
  imageUrl = await attemptFetch(`${baseApiUrl}&query=${encodeURIComponent(query)}`, headers);
  if (imageUrl) return imageUrl;

  console.error(`Todos los intentos de búsqueda de imagen fallaron para: ${recipe.name}`);
  return null; // Todos los intentos fallaron
}

// addPhotosToRecipes no cambia, sigue funcionando igual.
export async function addPhotosToRecipes(recipes: Recipe[]): Promise<Recipe[]> {
  const recipesWithPhotos = await Promise.all(
    recipes.map(async (recipe) => {
      const imageUrl = await getPhotoForRecipe(recipe);
      return {
        ...recipe,
        imageUrl: imageUrl || undefined,
      };
    })
  );
  return recipesWithPhotos;
}