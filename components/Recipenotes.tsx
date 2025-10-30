'use client';

import { useState, useEffect } from 'react';
import { RecipeNote } from '@/lib/types';
import styles from './Recipenotes.module.css';

interface RecipeNotesProps {
  recipeId: string;
}

export default function RecipeNotes({ recipeId }: RecipeNotesProps) {
  const [note, setNote] = useState<RecipeNote | null>(null);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNote();
  }, [recipeId]);

  const loadNote = async () => {
    try {
      const response = await fetch(`/api/recipe-notes?recipeId=${recipeId}`);
      const data = await response.json();
      if (data.notes && data.notes.length > 0) {
        const existingNote = data.notes[0];
        setNote(existingNote);
        setNotes(existingNote.notes);
        setRating(existingNote.rating || 0);
      }
    } catch (error) {
      console.error('Error cargando nota:', error);
    }
    setLoading(false);
  };

  const saveNote = async () => {
    if (!notes.trim() && rating === 0) return;

    setSaving(true);
    try {
      if (note) {
        // Actualizar nota existente
        const response = await fetch('/api/recipe-notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: note.id,
            notes: notes,
            rating: rating || null,
          }),
        });
        const data = await response.json();
        setNote(data.note);
      } else {
        // Crear nueva nota
        const response = await fetch('/api/recipe-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeId: recipeId,
            notes: notes,
            rating: rating || null,
          }),
        });
        const data = await response.json();
        setNote(data.note);
      }
      alert('Nota guardada correctamente');
    } catch (error) {
      console.error('Error guardando nota:', error);
      alert('Error al guardar la nota');
    }
    setSaving(false);
  };

  const deleteNote = async () => {
    if (!note || !confirm('¿Eliminar esta nota?')) return;

    try {
      await fetch(`/api/recipe-notes?id=${note.id}`, { method: 'DELETE' });
      setNote(null);
      setNotes('');
      setRating(0);
    } catch (error) {
      console.error('Error eliminando nota:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      <h3>Mis Notas y Valoración</h3>

      <div className={styles.rating}>
        <span>Tu valoración:</span>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className={`${styles.star} ${
                star <= (hoverRating || rating) ? styles.active : ''
              }`}
            >
              ★
            </button>
          ))}
        </div>
        {rating > 0 && (
          <button
            onClick={() => setRating(0)}
            className={styles.clearRating}
          >
            Limpiar
          </button>
        )}
      </div>

      <div className={styles.notesSection}>
        <textarea
          placeholder="Agrega notas personales sobre esta receta (modificaciones, tips, etc.)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={styles.textarea}
          rows={5}
        />
      </div>

      <div className={styles.actions}>
        <button
          onClick={saveNote}
          disabled={saving || (!notes.trim() && rating === 0)}
          className={styles.saveBtn}
        >
          {saving ? 'Guardando...' : note ? 'Actualizar Nota' : 'Guardar Nota'}
        </button>
        {note && (
          <button onClick={deleteNote} className={styles.deleteBtn}>
            Eliminar Nota
          </button>
        )}
      </div>
    </div>
  );
}