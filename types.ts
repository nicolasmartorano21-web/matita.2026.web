
export enum Category {
  ESCOLAR = 'Escolar',
  OFICINA = 'Oficina',
  TECNICA = 'Técnica',
  MERCERIA = 'Mercería',
  JUGUETERIA = 'Juguetería',
  REGALERIA = 'Regalería'
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  location?: string;
}

// NUEVO: Tipo para manejar la lógica de cupones de canje por puntos
export interface ClubCoupon extends Coupon {
  label: string;
  type: 'percent' | 'fixed';
  pointsRedeemed: number;
}

export interface Coupon {
  code: string;
  discount: number;
}

export interface Sale {
  id: string;
  date: string;
  total: number;
  itemsCount: number;
  itemsDetail: string;
}

// NUEVO: Tipo para definir variantes de color y su stock individual
export interface ProductColor {
  id: string;
  name: string; // Ej: "Rosa Pastel"
  hex: string;  // Ej: "#F48FB1"
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  curatorNote?: string;
  price: number;
  oldPrice?: number;
  category: Category;
  imageUrl: string;
  gallery?: string[];
  isVideo?: boolean;
  isNew?: boolean;
  reviews: Review[];
  stock: number;
  colors?: ProductColor[]; // NUEVO: Atributo opcional para productos con variantes
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: ProductColor; // NUEVO: Color elegido por el usuario en el carrito
}

export interface User {
  id: string;
  email: string;
  name: string;
  points: number;
  avatar?: string;
  level?: 'Bronce' | 'Plata' | 'Oro';
}

// NUEVO: Tipo para registro de transacciones de puntos
export interface PointsHistory {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'redeem';
  description: string;
  date: string;
}

export type ViewType = 'catalog' | 'news' | 'about' | 'reviews' | 'suggestions' | 'club' | 'favorites';
