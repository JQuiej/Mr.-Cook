'use client';

import { useState } from 'react';
import { Recipe } from '@/lib/types';
import styles from './ShareRecipe.module.css';

interface ShareRecipeProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function ShareRecipe({ recipe, onClose }: ShareRecipeProps) {
  const [shareLink, setShareLink] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shared-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeData: recipe }),
      });
      const data = await response.json();
      
      const link = `${window.location.origin}/shared/${data.sharedRecipe.share_code}`;
      setShareLink(link);
    } catch (error) {
      console.error('Error generando enlace:', error);
      alert('Error al generar enlace para compartir');
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeBtn}>
          ×
        </button>

        <h2>Compartir Receta</h2>
        <p className={styles.recipeName}>{recipe.name}</p>

        {!shareLink ? (
          <div className={styles.generate}>
            <p>Genera un enlace para compartir esta receta con otros</p>
            <button
              onClick={generateShareLink}
              disabled={loading}
              className={styles.generateBtn}
            >
              {loading ? 'Generando...' : 'Generar Enlace'}
            </button>
          </div>
        ) : (
          <div className={styles.shareSection}>
            <div className={styles.linkContainer}>
              <input
                type="text"
                value={shareLink}
                readOnly
                className={styles.linkInput}
              />
              <button onClick={copyToClipboard} className={styles.copyBtn}>
                {copied ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>

            <div className={styles.shareButtons}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Mira esta receta: ${recipe.name}\n${shareLink}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareBtn}
              >
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  shareLink
                )}&text=${encodeURIComponent(recipe.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareBtn}
              >
                Telegram
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(
                  recipe.name
                )}&body=${encodeURIComponent(
                  `Mira esta receta: ${shareLink}`
                )}`}
                className={styles.shareBtn}
              >
                Email
              </a>
            </div>

            <p className={styles.note}>
              Este enlace será público y cualquiera con él podrá ver la receta
            </p>
          </div>
        )}
      </div>
    </div>
  );
}