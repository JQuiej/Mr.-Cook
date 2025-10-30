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
      .from('shopping_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ lists: data || [] });
  } catch (error) {
    console.error('Error obteniendo listas:', error);
    return NextResponse.json(
      { error: 'Error al obtener listas' },
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

    const { name, items } = await request.json();

    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({
        user_id: user.id,
        name: name || 'Mi Lista',
        items: items || [],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ list: data });
  } catch (error) {
    console.error('Error creando lista:', error);
    return NextResponse.json(
      { error: 'Error al crear lista' },
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

    const { id, name, items } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('shopping_lists')
      .update({
        name: name,
        items: items,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ list: data });
  } catch (error) {
    console.error('Error actualizando lista:', error);
    return NextResponse.json(
      { error: 'Error al actualizar lista' },
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
      .from('shopping_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando lista:', error);
    return NextResponse.json(
      { error: 'Error al eliminar lista' },
      { status: 500 }
    );
  }
}