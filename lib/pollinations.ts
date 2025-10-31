import { Recipe } from './types';

export async function getPhotoForRecipe(recipe: Recipe): Promise<string> {
  const prompt = `professional food photography of ${recipe.name}, ${recipe.cuisine} cuisine, beautifully plated, appetizing, natural lighting, high quality`;
  
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&nologo=true&enhance=true`;
  
  console.log(`Generando imagen con Pollinations: ${recipe.name}`);
  return imageUrl;
}

export async function addPhotosToRecipes(recipes: Recipe[]): Promise<Recipe[]> {
  const recipesWithPhotos = await Promise.all(
    recipes.map(async (recipe) => ({
      ...recipe,
      imageUrl: await getPhotoForRecipe(recipe),
    }))
  );
  return recipesWithPhotos;
}