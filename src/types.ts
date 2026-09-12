export type UserRole = 'admin' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_de?: string;
  slug: string;
  description: string;
  description_de?: string;
  image_url: string;
  icon_name?: string;
  product_count?: number;
  is_active: boolean;
  created_at: string;
  is_german_specialty?: boolean;
}

export interface Product {
  id: string;
  title: string;
  title_de?: string;
  slug: string;
  description: string;
  description_de?: string;
  price: number;
  compare_at_price?: number;
  category_id: string;
  category_name?: string;
  category_name_de?: string;
  inventory_count: number;
  sku: string;
  images: string[];
  featured_badge?: 'Best Seller' | 'New' | 'Sale' | 'Featured' | null;
  rating: number;
  reviews_count: number;
  is_active: boolean;
  created_at: string;
  is_flash_deal?: boolean;
  flash_deal_discount?: number;
  flash_sold_count?: number;
  origin_country?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
}

export type OrderStatus =
  | 'placed'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface DeliveryEvent {
  id: string;
  timestamp: string;
  status: OrderStatus;
  location: string;
  description: string;
}

export interface OrderItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: 'stripe' | 'test_card';
  payment_status: PaymentStatus;
  stripe_payment_id?: string;
  order_status: OrderStatus;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
  delivery_history: DeliveryEvent[];
  created_at: string;
  updated_at: string;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  completedDeliveries: number;
  activeShipments: number;
  dailySales: { date: string; revenue: number; orders: number }[];
  categoryRevenue: { category: string; revenue: number; count: number }[];
  statusDistribution: { status: OrderStatus; count: number; percentage: number }[];
}
