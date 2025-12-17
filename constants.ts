import { Rarity } from './types';

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: 'from-gray-400 to-gray-600',
  [Rarity.RARE]: 'from-blue-400 to-indigo-600',
  [Rarity.LEGENDARY]: 'from-yellow-300 to-amber-600',
  [Rarity.LIMITED]: 'from-pink-400 to-rose-600',
};

export const STORAGE_KEYS = {
  CARDS: 'starcard_cards',
  COLLECTIONS: 'starcard_collections',
};