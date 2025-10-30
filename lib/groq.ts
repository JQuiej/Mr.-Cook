import Groq from 'groq-sdk';
import { Recipe } from './types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateRecipes(
  ingredients: string[],
  category?: string,
  cuisine?: string
): Promise<Recipe[]> {
  const ingredientsList = ingredients.length > 0 
    ? `usando principalmente estos ingredientes: ${ingredients.join(', ')}` 
    : '';
  
  const categoryFilter = category ? `de categoría ${category}` : '';
  const cuisineFilter = cuisine ? `de cocina ${cuisine}` : '';

  const prompt = `Genera exactamente 3 recetas ${categoryFilter} ${cuisineFilter} ${ingredientsList}.

IMPORTANTE: Responde ÚNICAMENTE con un array JSON válido, sin texto adicional, sin markdown, sin explicaciones.

Formato requerido:
[
  {
    "name": "Nombre de la receta",
    "description": "Breve descripción",
    "ingredients": [
      {"name": "ingrediente", "amount": "cantidad", "unit": "unidad"}
    ],
    "instructions": ["paso 1", "paso 2"],
    "prepTime": 15,
    "cookTime": 30,
    "category": "desayuno",
    "cuisine": "mexicana",
    "servings": 4
  }
]

Las categorías permitidas son: desayuno, almuerzo, cena, postre
Responde solo con el JSON, nada más.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente que genera recetas en formato JSON válido. Responde SOLO con JSON, sin texto adicional, sin markdown, sin comillas triples.'
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