'use client';

import { useState, useEffect } from 'react';
import { Recipe } from '@/lib/types';
import styles from './calendar.module.css';

interface CalendarEvent {
  id: string;
  recipe_data: Recipe;
  date: string;
  created_at: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/calendar');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
    setLoading(false);
  };

  const removeEvent = async (id: string) => {
    if (!confirm('¿Eliminar este evento?')) return;

    try {
      await fetch(`/api/calendar?id=${id}`, { method: 'DELETE' });
      setEvents(events.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Error eliminando evento:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((e) => e.date.split('T')[0] === dateStr);
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Calendario de Recetas</h1>
        <div className={styles.monthNav}>
          <button onClick={prevMonth} className={styles.navBtn}>
            ←
          </button>
          <h2>
            {monthNames[month]} {year}
          </h2>
          <button onClick={nextMonth} className={styles.navBtn}>
            →
          </button>
        </div>
      </div>

      <div className={styles.calendar}>
        <div className={styles.dayNames}>
          {dayNames.map((day) => (
            <div key={day} className={styles.dayName}>
              {day}
            </div>
          ))}
        </div>

        <div className={styles.days}>
          {Array.from({ length: startingDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className={styles.emptyDay} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const dayEvents = getEventsForDate(date);
            const isToday =
              new Date().toDateString() === date.toDateString();

            return (
              <div
                key={day}
                className={`${styles.day} ${isToday ? styles.today : ''}`}
              >
                <div className={styles.dayNumber}>{day}</div>
                <div className={styles.eventsContainer}>
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={styles.event}
                      onClick={() => setSelectedRecipe(event.recipe_data)}
                    >
                      <span>{event.recipe_data.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeEvent(event.id);
                        }}
                        className={styles.eventDelete}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedRecipe && (
        <div
          className={styles.modal}
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRecipe(null)}
              className={styles.closeBtn}
            >
              ×
            </button>

            <h2>{selectedRecipe.name}</h2>
            <p className={styles.description}>{selectedRecipe.description}</p>

            <div className={styles.ingredients}>
              <h3>Ingredientes</h3>
              <ul>
                {selectedRecipe.ingredients.map((ing, i) => (
                  <li key={i}>
                    {ing.amount} {ing.unit} de {ing.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.instructions}>
              <h3>Preparación</h3>
              <ol>
                {selectedRecipe.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}