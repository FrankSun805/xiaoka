import { StarCard, Collection, Rarity } from '../types';
import { STORAGE_KEYS } from '../constants';

export const getCards = (): StarCard[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CARDS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load cards", e);
    return [];
  }
};

export const saveCard = (card: StarCard): void => {
  const cards = getCards();
  const updated = [card, ...cards];
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(updated));
};

export const deleteCard = (id: string): void => {
  const cards = getCards();
  const updated = cards.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(updated));
};

export const toggleFavorite = (id: string): StarCard[] => {
  const cards = getCards();
  const updated = cards.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c);
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(updated));
  return updated;
};

// Seed initial data if empty
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.CARDS)) {
    // Add a demo card maybe? No, let's keep it clean for user.
  }
};