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

    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('recipeId');

    let query = supabase
      .from('recipe_notes')
      .select('*')
      .eq('user_id', user.id);

    if (recipeId) {
      query = query.eq('recipe_id', recipeId);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ notes: data || [] });
  } catch (error) {
    console.error('Error obteniendo notas:', error);
    return NextResponse.json(
      { error: 'Error al obtener notas' },
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

    const { recipeId, notes, rating } = await request.json();

    if (!recipeId || !notes) {
      return NextResponse.json(
        { error: 'recipeId y notes son requeridos' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('recipe_notes')
      .insert({
        user_id: user.id,
        recipe_id: recipeId,
        notes: notes,
        rating: rating || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ note: data });
  } catch (error) {
    console.error('Error guardando nota:', error);
    return NextResponse.json(
      { error: 'Error al guardar nota' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id, notes, rating } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('recipe_notes')
      .update({
        notes: notes,
        rating: rating || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ note: data });
  } catch (error) {
    console.error('Error actualizando nota:', error);
    return NextResponse.json(
      { error: 'Error al actualizar nota' },
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
      .from('recipe_notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando nota:', error);
    return NextResponse.json(
      { error: 'Error al eliminar nota' },
      { status: 500 }
    );
  }
}