import Groq from 'groq-sdk';
import { Recipe } from './types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateRecipes(
  ingredients: string[],
  category?: string,
  cuisine?: string,
  diet?: string,
  difficulty?: string
): Promise<Recipe[]> {
  const ingredientsList =
    ingredients.length > 0
      ? `usando principalmente estos ingredientes: ${ingredients.join(', ')}`
      : '';

  const categoryFilter = category ? `de categoría ${category}` : '';
  const cuisineFilter = cuisine ? `de cocina ${cuisine}` : '';
  const dietFilter = diet ? `que sea ${diet}` : '';
  const difficultyFilter = difficulty ? `de dificultad ${difficulty}` : '';

  // --- PROMPT MEJORADO Y SIMPLIFICADO ---
  const prompt = `Genera exactamente 3 recetas ${categoryFilter} ${cuisineFilter} ${dietFilter} ${difficultyFilter} ${ingredientsList}.

IMPORTANTE: Responde ÚNICAMENTE con un array JSON válido, sin texto adicional, sin markdown, sin explicaciones.

REGLAS PARA LAS RECETAS:
1. **Genera 3 recetas que sean significativamente DIFERENTES entre sí.**
2. **No generes variaciones de la misma receta.**
3. Los nombres de las recetas deben ser únicos y descriptivos.
4. **Añade un campo "difficulty"**: Debe ser 'fácil', 'media', o 'difícil'.
5. **Añade un campo "imageKeywords"**: Describe el plato específico EN INGLÉS.
   - Para platos conocidos internacionalmente, usa su nombre: "tres leches cake"
   - Para platos tradicionales guatemaltecos, describe visualmente:
     * "Rellenitos de Plátano" → "imageKeywords": "sweet plantain empanadas guatemalan"
     * "Chuchitos" → "imageKeywords": "guatemalan tamales corn husks"
     * "Pepián" → "imageKeywords": "guatemalan chicken stew"
   - Para platos comunes, sé específico: "scrambled eggs spinach", "grilled chicken rice"
   - Necesito que dependiendo los ingredientes haga una asimilacion a alguna otra receta que exista y que sea mas probable que alguna banco de datos tenga para asegurar que la imagen sea lo mas fiel a la receta
   6. Proporciona al menos 4 pasos claros en las "instructions" si es necesario mas colocalos entre mas detalle tengan las intrucciones mejor.

Formato requerido:
[
  {
    "name": "Puré de Papas con Carne y Tomate",
    "description": "Un plato reconfortante para el almuerzo",
    "imageKeywords": "mashed potatoes meat",
    "ingredients": [
      {"name": "Papa", "amount": "5", "unit": "unidades"},
      {"name": "Carne de Res", "amount": "400", "unit": "gramos"}
    ],
    "instructions": ["Cocinar las papas...", "Hacer el puré...", "Cocinar la carne con tomate..."],
    "prepTime": 15,
    "cookTime": 40,
    "category": "almuerzo",
    "cuisine": "internacional",
    "servings": 4,
    "difficulty": "fácil"
  }
]

Las categorías permitidas son: desayuno, almuerzo, cena, postre
Las dificultades permitidas son: fácil, media, difícil
Responde solo con el JSON, nada más.`;


  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente que genera recetas en formato JSON válido. Responde SOLO con JSON, sin texto adicional, sin markdown, sin comillas triples.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 4000,
    });

    let content = completion.choices[0]?.message?.content || '[]';

    // Limpiar el contenido de posibles caracteres extras
    content = content.trim();

    // Remover markdown si está presente
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/g, '');
    }

    // Remover texto antes o después del JSON
    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']');

    if (jsonStart !== -1 && jsonEnd !== -1) {
      content = content.substring(jsonStart, jsonEnd + 1);
    }

    console.log('Content to parse:', content); // Para debugging

    const recipes = JSON.parse(content);

    // Validar que sea un array
    if (!Array.isArray(recipes)) {
      console.error('Response is not an array');
      return [];
    }

    return recipes;
  } catch (error) {
    console.error('Error generating recipes:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return [];
  }
}