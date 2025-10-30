import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Generar código único de 8 caracteres
function generateShareCode(): string {
  return Math.random().toString(36).substring(2, 10);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const shareCode = searchParams.get('code');

    if (!shareCode) {
      return NextResponse.json(
        { error: 'Código requerido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('shared_recipes')
      .select('*')
      .eq('share_code', shareCode)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Receta no encontrada' },
        { status: 404 }
      );
    }

    // Incrementar vistas
    await supabase
      .from('shared_recipes')
      .update({ views: data.views + 1 })
      .eq('id', data.id);

    return NextResponse.json({ recipe: data });
  } catch (error) {
    console.error('Error obteniendo receta compartida:', error);
    return NextResponse.json(
      { error: 'Error al obtener receta' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { recipeData } = await request.json();

    if (!recipeData) {
      return NextResponse.json(
        { error: 'recipeData es requerido' },
        { status: 400 }
      );
    }

    // Generar código único
    let shareCode = generateShareCode();
    let attempts = 0;
    
    // Verificar que el código sea único (máximo 5 intentos)
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('shared_recipes')
        .select('id')
        .eq('share_code', shareCode)
        .single();

      if (!existing) break;
      
      shareCode = generateShareCode();
      attempts++;
    }

    const { data, error } = await supabase
      .from('shared_recipes')
      .insert({
        user_id: user.id,
        recipe_data: recipeData,
        share_code: shareCode,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ sharedRecipe: data });
  } catch (error) {
    console.error('Error compartiendo receta:', error);
    return NextResponse.json(
      { error: 'Error al compartir receta' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { error } = await supabase
      .from('shared_recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando receta compartida:', error);
    return NextResponse.json(
      { error: 'Error al eliminar receta compartida' },
      { status: 500 }
    );
  }
}