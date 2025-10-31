import { NextRequest, NextResponse } from 'next/server';
import { generateRecipes } from '@/lib/groq';
import { createClient } from '@/lib/supabase/server';
import { Recipe } from '@/lib/types';
import { addPhotosToRecipes } from '@/lib/Huggingface';
import { saveSearchToHistory } from '@/lib/historyUtils'; // <-- 1. Importar la función

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { ingredients, category, cuisine } = await request.json();

    // 1. Generar las recetas de Groq (como antes)
    const recipes: Recipe[] = await generateRecipes(
      ingredients || [],
      category,
      cuisine
    );

    // 2. Enriquecer las recetas con fotos de Unsplash
  const recipesWithPhotos = await addPhotosToRecipes(recipes);

    // --- 3. SECCIÓN CORREGIDA ---
    // Guardar en el historial llamando a la función directa
    if (recipesWithPhotos.length > 0) {
      // Usamos el cliente 'supabase' y 'user.id' que ya tenemos
      await saveSearchToHistory(supabase, user.id, {
        ingredients: ingredients || [],
        category: category || null,
        cuisine: cuisine || null,
        recipes: recipesWithPhotos,
      });
    }
    // --- FIN DE LA CORRECCIÓN ---

    // 4. Devolver las recetas enriquecidas al cliente
    return NextResponse.json({ recipes: recipesWithPhotos });

  } catch (error) {
    console.error('Error generando recetas:', error);
    // Si el error vino de saveSearchToHistory, también será capturado aquí
    return NextResponse.json(
      { error: 'Error al generar recetas' },
      { status: 500 }
    );
  }
}