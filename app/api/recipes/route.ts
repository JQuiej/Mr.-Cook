import { NextRequest, NextResponse } from 'next/server';
import { generateRecipes } from '@/lib/groq';
import { createClient } from '@/lib/supabase/server';

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

    const recipes = await generateRecipes(
      ingredients || [],
      category,
      cuisine
    );

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Error generando recetas:', error);
    return NextResponse.json(
      { error: 'Error al generar recetas' },
      { status: 500 }
    );
  }
}