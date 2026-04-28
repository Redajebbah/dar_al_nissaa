export interface Color {
  name: string;
  nameAr: string;
  hex: string;
}

export type ProductTag = 'handmade' | 'luxury' | 'new-collection' | 'bestseller' | 'promotion';

export interface Product {
  id: string;
  name: { fr: string; ar: string };
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: Category;
  subcategory?: string;
  sizes: string[];
  colors: Color[];
  description: { fr: string; ar: string };
  material?: string;
  fabric?: string;
  tags?: ProductTag[];
  inStock: boolean;
  isNew: boolean;
  isFeatured: boolean;
  rating?: number;
  reviews?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: Color;
}

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, size: string, color: Color, qty?: number) => void;
  removeItem: (productId: string, size: string, colorName: string) => void;
  updateQuantity: (productId: string, size: string, colorName: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export interface OrderForm {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
}

export type Category =
  | 'qmiss-jouhara'
  | 'qmiss-ghourza'
  | 'caftan'
  | 'takchita'
  | 'jelaba'
  | 'qmayess-rbati';

export interface Subcategory {
  slug: string;
  nameFr: string;
  nameAr: string;
}

export interface CategoryInfo {
  slug: Category;
  nameFr: string;
  nameAr: string;
  description: string;
  image: string;
  count: number;
  subcategories?: Subcategory[];
}

export type Language = 'fr' | 'ar';
