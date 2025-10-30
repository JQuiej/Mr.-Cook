'use client';

import { useState } from 'react';
import { Recipe } from '@/lib/types';
import { adjustServings } from '@/lib/recipeUtils';
import styles from './Servingsadjuster.module.css';

interface ServingsAdjusterProps {
  recipe: Recipe;
  onAdjust: (adjustedRecipe: Recipe) => void;
}

export default function ServingsAdjuster({
  recipe,
  onAdjust,
}: ServingsAdjusterProps) {
  const [servings, setServings] = useState(recipe.servings);

  const handleAdjust = (newServings: number) => {
    if (newServings < 1) return;
    setServings(newServings);
    const adjustedRecipe = adjustServings(recipe, newServings);
    onAdjust(adjustedRecipe);
  };

  const increment = () => handleAdjust(servings + 1);
  const decrement = () => handleAdjust(servings - 1);

  return (
    <div className={styles.container}>
      <label>Porciones:</label>
      <div className={styles.controls}>
        <button
          onClick={decrement}
          disabled={servings <= 1}
          className={styles.btn}
        >
          -
        </button>
        <input
          type="number"
          value={servings}
          onChange={(e) => handleAdjust(parseInt(e.target.value) || 1)}
          min="1"
          className={styles.input}
        />
        <button onClick={increment} className={styles.btn}>
          +
        </button>
      </div>
      <span className={styles.info}>
        {servings === recipe.servings
          ? '(Original)'
          : `(Original: ${recipe.servings})`}
      </span>
    </div>
  );
}