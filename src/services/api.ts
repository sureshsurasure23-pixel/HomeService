import {
  AdminStats,
  Booking,
  BookingStatus,
  Notification,
  Payment,
  PaymentMethod,
  ProviderProfile,
  ProviderStats,
  Review,
  Service,
  ServiceCategory,
  User,
} from '../types.ts';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: User; profile: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (payload: any) =>
    request<{ token: string; user: User; profile: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: User; profile: any }>('/auth/me'),

  forgotPassword: (email: string) =>
    request<{ message: string; reset_token?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Categories
  getCategories: (includeAll = false) =>
    request<ServiceCategory[]>(`/categories${includeAll ? '?all=true' : ''}`),

  getCategoryById: (id: string) => request<ServiceCategory>(`/categories/${id}`),

  createCategory: (data: Partial<ServiceCategory>) =>
    request<ServiceCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategory: (id: string, data: Partial<ServiceCategory>) =>
    request<ServiceCategory>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: string) =>
    request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    }),

  // Services
  getServices: (params?: {
    category_id?: string;
    provider_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.category_id) query.set('category_id', params.category_id);
    if (params?.provider_id) query.set('provider_id', params.provider_id);
    if (params?.search) query.set('search', params.search);
    if (params?.min_price) query.set('min_price', String(params.min_price));
    if (params?.max_price) query.set('max_price', String(params.max_price));
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    const qs = query.toString();
    return request<Service[]>(`/services${qs ? `?${qs}` : ''}`);
  },

  getServiceById: (id: string) =>
    request<Service & { reviews: Review[]; related: Service[] }>(`/services/${id}`),

  getSuggestions: (query: string) =>
    request<{ categories: ServiceCategory[]; services: Service[] }>(
      `/services/suggestions?q=${encodeURIComponent(query)}`
    ),

  createService: (data: Partial<Service>) =>
    request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateService: (id: string, data: Partial<Service>) =>
    request<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteService: (id: string) =>
    request<{ message: string }>(`/services/${id}`, {
      method: 'DELETE',
    }),

  // Providers
  getProviders: (params?: { category_id?: string; city?: string; search?: string; all?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category_id) query.set('category_id', params.category_id);
    if (params?.city) query.set('city', params.city);
    if (params?.search) query.set('search', params.search);
    if (params?.all) query.set('all', 'true');
    const qs = query.toString();
    return request<ProviderProfile[]>(`/providers${qs ? `?${qs}` : ''}`);
  },

  getProviderById: (id: string) =>
    request<ProviderProfile & { services: Service[]; reviews: Review[] }>(`/providers/${id}`),

  updateProviderStatus: (id: string, is_approved: boolean) =>
    request<ProviderProfile>(`/providers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_approved }),
    }),

  toggleProviderAvailability: () =>
    request<{ is_available: boolean }>('/providers/availability/toggle', {
      method: 'PUT',
    }),

  // Bookings
  getBookings: (status?: string) =>
    request<Booking[]>(`/bookings${status ? `?status=${encodeURIComponent(status)}` : ''}`),

  getBookingById: (id: string) => request<Booking>(`/bookings/${id}`),

  checkAvailability: (data: { provider_id: string; booking_date: string; booking_time: string }) =>
    request<{ available: boolean; message: string }>('/bookings/check-availability', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createBooking: (data: {
    service_id: string;
    booking_date: string;
    booking_time: string;
    location_address: string;
    city: string;
    requirements?: string;
  }) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateBookingStatus: (id: string, status: BookingStatus, reason?: string) =>
    request<Booking>(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    }),

  // Payments
  getPayments: () => request<Payment[]>('/payments'),

  processPayment: (data: {
    booking_id: string;
    payment_method: PaymentMethod;
    simulate_failure?: boolean;
  }) =>
    request<{ success: boolean; payment: Payment; booking: Booking }>('/payments/process', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Reviews
  getReviews: (params?: { service_id?: string; provider_id?: string; customer_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.service_id) query.set('service_id', params.service_id);
    if (params?.provider_id) query.set('provider_id', params.provider_id);
    if (params?.customer_id) query.set('customer_id', params.customer_id);
    const qs = query.toString();
    return request<Review[]>(`/reviews${qs ? `?${qs}` : ''}`);
  },

  createReview: (data: { booking_id: string; rating: number; comment: string }) =>
    request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Notifications
  getNotifications: () => request<Notification[]>('/notifications'),

  markNotificationRead: (id: string) =>
    request<Notification>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () =>
    request<{ updated: number }>('/notifications/read-all', {
      method: 'PUT',
    }),

  // Profile
  getProfile: () => request<{ user: User; profile: any }>('/users/profile'),

  updateProfile: (data: any) =>
    request<{ user: User; profile: any }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getProviderStats: () => request<ProviderStats>('/users/provider/stats'),

  // Admin
  getAdminStats: () => request<AdminStats>('/admin/stats'),

  getAdminUsers: (role?: string) =>
    request<User[]>(`/admin/users${role ? `?role=${role}` : ''}`),

  updateUserStatus: (id: string, is_active: boolean) =>
    request<User>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active }),
    }),
};
