import { Recipe, Ingredient } from './types';

export function adjustServings(recipe: Recipe, newServings: number): Recipe {
  const ratio = newServings / recipe.servings;

  const adjustedIngredients = recipe.ingredients.map((ingredient) => {
    const amount = parseFloat(ingredient.amount);
    
    if (isNaN(amount)) {
      // Si no es un número, devolver sin cambios
      return ingredient;
    }

    const newAmount = amount * ratio;
    
    // Redondear a 2 decimales
    const roundedAmount = Math.round(newAmount * 100) / 100;

    return {
      ...ingredient,
      amount: roundedAmount.toString(),
    };
  });

  return {
    ...recipe,
    servings: newServings,
    ingredients: adjustedIngredients,
  };
}

export function parseAmount(amount: string): number {
  // Convertir fracciones comunes a decimales
  const fractionMap: { [key: string]: number } = {
    '1/4': 0.25,
    '1/3': 0.33,
    '1/2': 0.5,
    '2/3': 0.67,
    '3/4': 0.75,
  };

  // Buscar si hay una fracción
  for (const [fraction, decimal] of Object.entries(fractionMap)) {
    if (amount.includes(fraction)) {
      const rest = amount.replace(fraction, '').trim();
      const restNum = rest ? parseFloat(rest) : 0;
      return restNum + decimal;
    }
  }

  return parseFloat(amount) || 0;
}