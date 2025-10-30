'use client';

import { useState } from 'react';
import { Recipe } from '@/lib/types';
import styles from './CookingMode.module.css';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function CookingMode({ recipe, onClose }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timers, setTimers] = useState<{ [key: number]: number }>({});
  const [activeTimer, setActiveTimer] = useState<number | null>(null);

  const nextStep = () => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startTimer = (minutes: number) => {
    const seconds = minutes * 60;
    setTimers({ ...timers, [currentStep]: seconds });
    setActiveTimer(currentStep);

    const interval = setInterval(() => {
      setTimers((prev) => {
        const newTime = (prev[currentStep] || 0) - 1;
        if (newTime <= 0) {
          clearInterval(interval);
          setActiveTimer(null);
          alert('¡Tiempo completado!');
          return { ...prev, [currentStep]: 0 };
        }
        return { ...prev, [currentStep]: newTime };
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <button onClick={onClose} className={styles.closeBtn}>
          ← Salir del Modo Cocina
        </button>

        <div className={styles.header}>
          <h1>{recipe.name}</h1>
          <div className={styles.progress}>
            Paso {currentStep + 1} de {recipe.instructions.length}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.ingredientsSection}>
            <h2>Ingredientes</h2>
            <div className={styles.ingredientsList}>
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className={styles.ingredient}>
                  <span className={styles.amount}>
                    {ing.amount} {ing.unit}
                  </span>
                  <span className={styles.name}>{ing.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.stepSection}>
            <div className={styles.stepNumber}>Paso {currentStep + 1}</div>
            <div className={styles.stepInstruction}>
              {recipe.instructions[currentStep]}
            </div>

            {activeTimer === currentStep && timers[currentStep] > 0 && (
              <div className={styles.timer}>
                ⏲️ {formatTime(timers[currentStep])}
              </div>
            )}

            <div className={styles.timerButtons}>
              <button
                onClick={() => startTimer(5)}
                className={styles.timerBtn}
              >
                5 min
              </button>
              <button
                onClick={() => startTimer(10)}
                className={styles.timerBtn}
              >
                10 min
              </button>
              <button
                onClick={() => startTimer(15)}
                className={styles.timerBtn}
              >
                15 min
              </button>
              <button
                onClick={() => startTimer(20)}
                className={styles.timerBtn}
              >
                20 min
              </button>
            </div>
          </div>
        </div>

        <div className={styles.navigation}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={styles.navBtn}
          >
            ← Anterior
          </button>
          <button
            onClick={nextStep}
            disabled={currentStep === recipe.instructions.length - 1}
            className={styles.navBtn}
          >
            Siguiente →
          </button>
        </div>

        {currentStep === recipe.instructions.length - 1 && (
          <div className={styles.complete}>
            <p>¡Has completado todos los pasos!</p>
            <button onClick={onClose} className={styles.doneBtn}>
              Finalizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}