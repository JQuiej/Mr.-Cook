// lib/Huggingface.ts
import { Recipe } from './types';
import { createClient } from '@supabase/supabase-js';

// NOTA: No creamos el cliente aquí.

export async function getPhotoForRecipe(recipe: Recipe): Promise<string | null> {
  
  // --- 1. Inicializa variables y cliente DENTRO de la función ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Faltan variables de entorno de Supabase (URL o Service Key)');
    return null;
  }
  
  if (!apiKey) {
    console.error('HUGGINGFACE_API_KEY no configurada');
    return null;
  }

  // --- 2. Crea los clientes solo cuando la función se llama ---
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
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
    
    const filename = `${recipe.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.jpg`;
    const bucketName = 'recipe-images'; // Asegúrate que tu bucket se llame así

    const { data, error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Error subiendo a Supabase Storage:', uploadError);
      return null;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filename);

    if (!publicUrlData) {
      console.error('Error obteniendo la URL pública');
      return null;
    }
    
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('Error en Hugging Face:', error);
    return null;
  }
}

// La función addPhotosToRecipes no cambia
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