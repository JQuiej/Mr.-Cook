import { Recipe } from './types';

interface PexelsPhoto {
  src: {
    large: string;
    medium: string;
    original: string;
  };
}

interface PexelsResponse {
  photos: PexelsPhoto[];
}

async function searchPexels(query: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  
  if (!apiKey) {
    console.error('PEXELS_API_KEY no está configurada.');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      console.warn(`Pexels query falló: ${response.statusText}`);
      return null;
    }

    const data: PexelsResponse = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large;
    }
    
    return null;
  } catch (error) {
    console.error(`Error en fetch de Pexels:`, error);
    return null;
  }
}

// Traduce platos/ingredientes regionales a términos más comunes en inglés
function normalizeKeywords(keywords: string): string {
  const replacements: Record<string, string> = {
    'chaya': 'spinach',
    'loroco': 'vegetables',
    'güisquil': 'squash',
    'plátano': 'banana',
    'platano': 'banana',
    'frijoles': 'beans',
    'atol': 'porridge',
    'tamales': 'tamales',
    'pupusa': 'tortilla',
    'elote': 'corn',
    'chiltepe': 'chili',
  };
  
  let normalized = keywords.toLowerCase();
  
  for (const [regional, common] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${regional}\\b`, 'gi');
    normalized = normalized.replace(regex, common);
  }
  
  return normalized;
}

export async function getPhotoForRecipe(recipe: Recipe): Promise<string | null> {
  // Intento 1: Keywords originales de la IA
  if (recipe.imageKeywords) {
    console.log(`Intento 1 - Keywords originales: ${recipe.imageKeywords}`);
    let imageUrl = await searchPexels(recipe.imageKeywords);
    if (imageUrl) return imageUrl;
    
    // Intento 2: Keywords normalizadas (ingredientes regionales → comunes)
    const normalized = normalizeKeywords(recipe.imageKeywords);
    if (normalized !== recipe.imageKeywords.toLowerCase()) {
      console.log(`Intento 2 - Keywords normalizadas: ${normalized}`);
      imageUrl = await searchPexels(normalized);
      if (imageUrl) return imageUrl;
    }
  }
  
  // Intento 3: Ingrediente principal + "food"
  const mainIngredient = recipe.ingredients[0]?.name.toLowerCase();
  if (mainIngredient) {
    const query = `${normalizeKeywords(mainIngredient)} food`;
    console.log(`Intento 3 - Ingrediente principal: ${query}`);
    const imageUrl = await searchPexels(query);
    if (imageUrl) return imageUrl;
  }
  
  // Intento 4: Categoría + cocina genérica
  const cuisineMap: Record<string, string> = {
    'guatemalteca': 'latin american',
    'mexicana': 'mexican',
    'italiana': 'italian',
    'española': 'spanish',
    'asiática': 'asian',
    'americana': 'american',
  };
  
  const mappedCuisine = cuisineMap[recipe.cuisine.toLowerCase()] || recipe.cuisine;
  const query = `${recipe.category} ${mappedCuisine} food`;
  console.log(`Intento 4 - Categoría+cocina: ${query}`);
  let imageUrl = await searchPexels(query);
  if (imageUrl) return imageUrl;
  
  // Fallback final: Solo categoría
  const fallback = `${recipe.category} breakfast lunch dinner dessert`.includes(recipe.category) 
    ? `${recipe.category} food` 
    : 'traditional food';
  console.log(`Fallback final: ${fallback}`);
  imageUrl = await searchPexels(fallback);
  if (imageUrl) return imageUrl;
  
  // Fallback de emergencia: imágenes por defecto de Pexels (URLs estáticas)
  const defaultImages: Record<string, string> = {
    'desayuno': 'https://images.pexels.com/photos/101533/pexels-photo-101533.jpeg',
    'almuerzo': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    'cena': 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
    'postre': 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
  };
  
  console.log(`Usando imagen por defecto para: ${recipe.category}`);
  return defaultImages[recipe.category] || defaultImages['almuerzo'];
}

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