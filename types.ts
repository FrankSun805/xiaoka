export enum Rarity {
  COMMON = 'Common',
  RARE = 'Rare',
  LEGENDARY = 'Legendary',
  LIMITED = 'Limited Edition'
}

export interface StarCard {
  id: string;
  imageUrl: string;
  name: string; // Idol Name
  group: string; // Group Name
  rarity: Rarity;
  vibe: string; // Short generated description
  createdAt: number;
  isFavorite: boolean;
  texture: 'glossy' | 'matte' | 'holo';
}

export interface Collection {
  id: string;
  name: string;
  coverImage?: string;
  cardIds: string[];
  createdAt: number;
}

export type TabView = 'home' | 'create' | 'collection' | 'profile';