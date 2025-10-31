import { Recipe } from './types';

export async function getPhotoForRecipe(recipe: Recipe): Promise<string | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    console.error('HUGGINGFACE_API_KEY no configurada');
    return null;
  }

  const prompt = `professional food photography of ${recipe.name}, appetizing, natural lighting, high quality`;

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true }
        }),
      }
    );

    if (!response.ok) {
      console.error(`Hugging Face falló: ${response.statusText}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Guardar en public/recipe-images/
    const fs = require('fs');
    const path = require('path');
    
    const filename = `${recipe.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.jpg`;
    const publicPath = path.join(process.cwd(), 'public', 'recipe-images');
    
    // Crear carpeta si no existe
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }
    
    const filepath = path.join(publicPath, filename);
    fs.writeFileSync(filepath, buffer);
    
    return `/recipe-images/${filename}`;
  } catch (error) {
    console.error('Error en Hugging Face:', error);
    return null;
  }
}

export async function addPhotosToRecipes(recipes: Recipe[]): Promise<Recipe[]> {
  const recipesWithPhotos: Recipe[] = [];
  
  for (const recipe of recipes) {
    const imageUrl = await getPhotoForRecipe(recipe);
    recipesWithPhotos.push({
      ...recipe,
      imageUrl: imageUrl || undefined,
    });
  }

  return recipesWithPhotos;
}