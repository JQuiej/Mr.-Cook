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
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ events: data || [] });
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos' },
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

    const { recipeData, date } = await request.json();

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        recipe_data: recipeData,
        date: date,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ event: data });
  } catch (error) {
    console.error('Error guardando evento:', error);
    return NextResponse.json(
      { error: 'Error al guardar evento' },
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
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando evento:', error);
    return NextResponse.json(
      { error: 'Error al eliminar evento' },
      { status: 500 }
    );
  }
}