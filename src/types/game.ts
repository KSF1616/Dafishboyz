export interface Game {
  id: string;
  slug?: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  players: string;
  playTime: string;
  age: string;
  price: number;
  category: string;
}

export interface CartItem {
  game: Game;
  quantity: number;
  type: 'digital' | 'physical';
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  game: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}
