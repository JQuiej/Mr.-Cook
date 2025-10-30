import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ favorites: data || [] });
  } catch (error) {
    console.error('Error obteniendo favoritas:', error);
    return NextResponse.json(
      { error: 'Error al obtener favoritas' },
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

    const { recipeName, recipeData } = await request.json();

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        recipe_name: recipeName,
        recipe_data: recipeData,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ favorite: data });
  } catch (error) {
    console.error('Error guardando favorita:', error);
    return NextResponse.json(
      { error: 'Error al guardar favorita' },
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
      .from('favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando favorita:', error);
    return NextResponse.json(
      { error: 'Error al eliminar favorita' },
      { status: 500 }
    );
  }
}