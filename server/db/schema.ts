export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'customer' | 'provider' | 'admin';
  name: string;
  phone: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  notes?: string;
  created_at: string;
}

export interface ProviderProfile {
  id: string;
  user_id: string;
  business_name: string;
  bio: string;
  experience_years: number;
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  is_approved: boolean;
  is_available: boolean;
  address: string;
  city: string;
  id_verified: boolean;
  category_id: string;
  created_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  provider_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  duration_mins: number;
  image_url: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BookingStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Confirmed'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export interface Booking {
  id: string;
  booking_number: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  booking_date: string; // YYYY-MM-DD
  booking_time: string; // HH:mm or slot like "10:00 AM"
  location_address: string;
  city: string;
  requirements?: string;
  status: BookingStatus;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 'Cash on Service' | 'Online Payment';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

export interface Payment {
  id: string;
  booking_id: string;
  customer_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id: string;
  gateway?: string;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'system' | 'review';
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

export interface MarketplaceDatabase {
  users: User[];
  customerProfiles: CustomerProfile[];
  providerProfiles: ProviderProfile[];
  categories: ServiceCategory[];
  services: Service[];
  bookings: Booking[];
  payments: Payment[];
  reviews: Review[];
  notifications: Notification[];
}
