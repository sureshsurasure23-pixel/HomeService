export type UserRole = 'customer' | 'provider' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  notes?: string;
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
  user?: Partial<User>;
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
  category?: ServiceCategory;
  provider?: ProviderProfile & { user?: Partial<User> };
  reviews_count?: number;
}

export type BookingStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Confirmed'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

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
  booking?: Booking;
  service?: Service;
  customer?: Partial<User>;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer?: {
    name: string;
    avatar_url?: string;
  };
  service?: {
    id: string;
    title: string;
  };
  provider?: {
    business_name: string;
  };
}

export interface Booking {
  id: string;
  booking_number: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  location_address: string;
  city: string;
  requirements?: string;
  status: BookingStatus;
  cancellation_reason?: string;
  created_at: string;
  service?: Service;
  category?: ServiceCategory;
  provider?: ProviderProfile & { user?: Partial<User> };
  customer?: Partial<User>;
  payment?: Payment;
  review?: Review;
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

export interface AdminStats {
  metrics: {
    totalCustomers: number;
    totalProviders: number;
    totalServices: number;
    totalBookings: number;
    totalRevenue: number;
    totalReviews: number;
    totalCategories: number;
  };
  statusCounts: Record<string, number>;
  categoryStats: Array<{
    id: string;
    name: string;
    servicesCount: number;
    bookingsCount: number;
  }>;
  recentBookings: Booking[];
}

export interface ProviderStats {
  metrics: {
    servicesCount: number;
    totalBookings: number;
    pendingRequests: number;
    completedJobs: number;
    inProgressJobs: number;
    totalEarnings: number;
    rating: number;
    totalReviews: number;
    isAvailable: boolean;
    isApproved: boolean;
  };
  recentBookings: Booking[];
}
