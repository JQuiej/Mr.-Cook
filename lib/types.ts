export interface Recipe {
  id?: string;
  name: string;
  description?: string;
  imageKeywords?: string; // <-- AÑADIR ESTE CAMPO
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  category: 'desayuno' | 'almuerzo' | 'cena' | 'postre';
  cuisine: string;
  servings: number;
  imageUrl?: string;
  difficulty?: 'fácil' | 'media' | 'difícil';
  userId?: string;
  createdAt?: string;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface FavoriteRecipe {
  id: string;
  userId: string;
  recipeName: string;
  recipeData: Recipe;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  recipeData: Recipe;
  date: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
}

// Nuevos tipos para las funcionalidades

export interface SearchHistory {
  id: string;
  user_id: string;
  ingredients: string[];
  category: string | null;
  cuisine: string | null;
  recipes_data: Recipe[];
  diet: string | null;
  difficulty: string | null;
  created_at: string;
}

export interface RecipeNote {
  id: string;
  user_id: string;
  recipe_id: string;
  notes: string;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
  checked: boolean;
  recipeSource?: string;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  items: ShoppingListItem[];
  created_at: string;
  updated_at: string;
}

export interface SharedRecipe {
  id: string;
  user_id: string;
  recipe_data: Recipe;
  share_code: string;
  views: number;
  created_at: string;
}