import { SupabaseClient } from '@supabase/supabase-js';
import { Recipe } from './types';

/**
 * Guarda una búsqueda en la tabla search_history
 */
export async function saveSearchToHistory(
  supabase: SupabaseClient,
  userId: string,
  searchData: {
    ingredients: string[];
    category: string | null;
    cuisine: string | null;
    recipes: Recipe[];
  }
) {
  const { ingredients, category, cuisine, recipes } = searchData;

  const { data, error } = await supabase
    .from('search_history')
    .insert({
      user_id: userId,
      ingredients: ingredients || [],
      category: category || null,
      cuisine: cuisine || null,
      recipes_data: recipes,
    })
    .select()
    .single();

  if (error) {
    // Usamos console.error para que el error se vea en el log del servidor
    console.error('Error guardando en historial:', error.message);
    // Hacemos throw para que la función que llama (la API) sepa que algo falló
    throw new Error(`Error al guardar historial: ${error.message}`);
  }

  return data;
}