// Database types and interfaces

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface Restaurant {
  id: string;
  chain_id?: string;
  name: string;
  description?: string;
  cuisine_type: string[];
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  business_hours?: Record<string, string>;
  delivery_radius_km?: number;
  minimum_order_amount?: number;
  delivery_fee?: number;
  is_active: boolean;
  is_accepting_orders: boolean;
  average_rating?: number;
  total_reviews?: number;
  created_at: Date;
  updated_at: Date;
  menu_items?: FoodItem[];
}

export interface FoodCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  total_items?: number;
  available_items?: number;
}

export interface FoodItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  discounted_price?: number;
  ingredients?: string[];
  allergens?: string[];
  dietary_info?: string[];
  calories?: number;
  prep_time_minutes?: number;
  image_url?: string;
  gallery_urls?: string[];
  is_available: boolean;
  is_featured: boolean;
  average_rating?: number;
  total_reviews?: number;
  total_orders?: number;
  created_at: Date;
  updated_at: Date;
  category_name?: string;
  restaurant_name?: string;
  delivery_fee?: number;
  minimum_order_amount?: number;
  variants?: FoodItemVariant[];
}

export interface FoodItemVariant {
  id: string;
  food_item_id: string;
  name: string;
  type: string;
  price_modifier: number;
  is_default: boolean;
  created_at: Date;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  email_verification_token?: string;
  email_verification_expires?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  last_login?: Date;
  login_attempts: number;
  locked_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  user_id: string;
  avatar_url?: string;
  date_of_birth?: Date;
  gender?: string;
  dietary_preferences?: string[];
  allergies?: string[];
  preferred_language: string;
  notification_preferences: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  restaurant_id: string;
  delivery_type: DeliveryType;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  delivery_fee: number;
  discount_amount: number;
  tip_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method?: string;
  delivery_address_id?: string;
  delivery_instructions?: string;
  estimated_delivery_time?: Date;
  actual_delivery_time?: Date;
  assigned_to?: string;
  special_instructions?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  food_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  selected_variants?: Record<string, any>;
  created_at: Date;
}

// Enums
export type UserRole = 'super_admin' | 'chain_owner' | 'location_admin' | 'employee' | 'delivery_person' | 'customer';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type DeliveryType = 'pickup' | 'delivery' | 'dine_in';

// Request/Response types
export interface SearchParams {
  q?: string;
  category?: string;
  restaurant?: string;
  diet?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

export interface RestaurantWithMenu extends Restaurant {
  menu_items: FoodItem[];
}

export interface MenuByCategory {
  [categoryName: string]: FoodItem[];
}

// Database query result types
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
}

// Error types
export interface DatabaseError extends Error {
  code?: string;
  detail?: string;
  table?: string;
  constraint?: string;
}