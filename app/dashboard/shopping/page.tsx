'use client';

import { useState, useEffect } from 'react';
import { ShoppingList, ShoppingListItem } from '@/lib/types';
import styles from './shopping.module.css';

export default function ShoppingPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const response = await fetch('/api/shopping-lists');
      const data = await response.json();
      setLists(data.lists || []);
      if (data.lists && data.lists.length > 0) {
        setCurrentList(data.lists[0]);
      }
    } catch (error) {
      console.error('Error cargando listas:', error);
    }
    setLoading(false);
  };

  const createNewList = async () => {
    if (!newListName.trim()) return;

    try {
      const response = await fetch('/api/shopping-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newListName,
          items: [],
        }),
      });
      const data = await response.json();
      setLists([data.list, ...lists]);
      setCurrentList(data.list);
      setShowNewListModal(false);
      setNewListName('');
    } catch (error) {
      console.error('Error creando lista:', error);
    }
  };

  const addItem = () => {
    if (!currentList || !newItemName.trim()) return;

    const newItem: ShoppingListItem = {
      id: Date.now().toString(),
      name: newItemName,
      amount: newItemAmount,
      unit: newItemUnit,
      checked: false,
    };

    const updatedItems = [...currentList.items, newItem];
    updateList(updatedItems);

    setNewItemName('');
    setNewItemAmount('');
    setNewItemUnit('');
  };

  const toggleItem = (itemId: string) => {
    if (!currentList) return;

    const updatedItems = currentList.items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    updateList(updatedItems);
  };

  const deleteItem = (itemId: string) => {
    if (!currentList) return;

    const updatedItems = currentList.items.filter((item) => item.id !== itemId);
    updateList(updatedItems);
  };

  const updateList = async (items: ShoppingListItem[]) => {
    if (!currentList) return;

    try {
      const response = await fetch('/api/shopping-lists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentList.id,
          name: currentList.name,
          items: items,
        }),
      });
      const data = await response.json();
      setCurrentList(data.list);
      setLists(lists.map((l) => (l.id === data.list.id ? data.list : l)));
    } catch (error) {
      console.error('Error actualizando lista:', error);
    }
  };

  const deleteList = async (listId: string) => {
    if (!confirm('¿Eliminar esta lista?')) return;

    try {
      await fetch(`/api/shopping-lists?id=${listId}`, { method: 'DELETE' });
      const updatedLists = lists.filter((l) => l.id !== listId);
      setLists(updatedLists);
      if (currentList?.id === listId) {
        setCurrentList(updatedLists[0] || null);
      }
    } catch (error) {
      console.error('Error eliminando lista:', error);
    }
  };

  const clearChecked = () => {
    if (!currentList) return;
    const updatedItems = currentList.items.filter((item) => !item.checked);
    updateList(updatedItems);
  };

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>      Lista de Compras</h1>
        <button onClick={() => setShowNewListModal(true)} className={styles.newListBtn}>
          + Nueva Lista
        </button>
      </div>

      <div className={styles.content}>
        <aside className={styles.listsSidebar}>
          <h3>Mis Listas</h3>
          {lists.length === 0 ? (
            <p className={styles.emptyMessage}>No tienes listas</p>
          ) : (
            lists.map((list) => (
              <div
                key={list.id}
                className={`${styles.listItem} ${
                  currentList?.id === list.id ? styles.active : ''
                }`}
                onClick={() => setCurrentList(list)}
              >
                <div>
                  <h4>{list.name}</h4>
                  <span>
                    {list.items.filter((i) => i.checked).length}/{list.items.length}{' '}
                    completados
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteList(list.id);
                  }}
                  className={styles.deleteListBtn}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </aside>

        <main className={styles.listContent}>
          {currentList ? (
            <>
              <div className={styles.listHeader}>
                <h2>{currentList.name}</h2>
                <button onClick={clearChecked} className={styles.clearBtn}>
                  Limpiar Completados
                </button>
              </div>

              <div className={styles.addItem}>
                <input
                  type="text"
                  placeholder="Nombre del ingrediente"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                />
                <input
                  type="text"
                  placeholder="Cantidad"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  className={styles.smallInput}
                />
                <input
                  type="text"
                  placeholder="Unidad"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className={styles.smallInput}
                />
                <button onClick={addItem} className={styles.addBtn}>
                  Agregar
                </button>
              </div>

              <div className={styles.items}>
                {currentList.items.length === 0 ? (
                  <p className={styles.emptyMessage}>
                    No hay ingredientes en esta lista
                  </p>
                ) : (
                  (() => {
                    // Agrupar items por receta
                    const grouped = currentList.items.reduce((acc, item) => {
                      const recipe = item.recipeSource || 'Otros ingredientes';
                      if (!acc[recipe]) acc[recipe] = [];
                      acc[recipe].push(item);
                      return acc;
                    }, {} as Record<string, ShoppingListItem[]>);

                    return Object.entries(grouped).map(([recipeName, items]) => (
                      <div key={recipeName} className={styles.recipeGroup}>
                        <h3 className={styles.recipeGroupTitle}>
                          🍽️ {recipeName}
                        </h3>
                        <div className={styles.recipeItems}>
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className={`${styles.item} ${
                                item.checked ? styles.checked : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => toggleItem(item.id)}
                              />
                              <div className={styles.itemInfo}>
                                <span className={styles.itemName}>{item.name}</span>
                                <span className={styles.itemAmount}>
                                  {item.amount} {item.unit}
                                </span>
                              </div>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className={styles.deleteItemBtn}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()
                )}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>Crea una lista para comenzar</p>
            </div>
          )}
        </main>
      </div>

      {showNewListModal && (
        <div className={styles.modal} onClick={() => setShowNewListModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Nueva Lista</h2>
            <input
              type="text"
              placeholder="Nombre de la lista"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createNewList()}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button onClick={createNewList} className={styles.confirmBtn}>
                Crear
              </button>
              <button
                onClick={() => setShowNewListModal(false)}
                className={styles.cancelBtn}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}