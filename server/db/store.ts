import fs from 'fs';
import path from 'path';
import {
  Booking,
  CustomerProfile,
  MarketplaceDatabase,
  Notification,
  Payment,
  ProviderProfile,
  Review,
  Service,
  ServiceCategory,
  User,
} from './schema.ts';
import { getInitialSeedData } from './seedData.ts';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'marketplace_db.json');

class DatabaseStore {
  private data: MarketplaceDatabase;
  private isLoaded = false;

  constructor() {
    this.data = getInitialSeedData();
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as MarketplaceDatabase;
        if (parsed.users && parsed.categories && parsed.services) {
          this.data = parsed;
          this.isLoaded = true;
          return;
        }
      }

      // If file doesn't exist or is invalid, seed initial data
      this.data = getInitialSeedData();
      this.persist();
      this.isLoaded = true;
    } catch (err) {
      console.error('[DB] Failed to load disk database, using fresh seed data:', err);
      this.data = getInitialSeedData();
      this.isLoaded = true;
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error persisting database to disk:', err);
    }
  }

  // --- Users ---
  getUsers() {
    return this.data.users;
  }

  getUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User) {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.data.users[idx];
  }

  // --- Customer Profiles ---
  getCustomerProfileByUserId(userId: string) {
    return this.data.customerProfiles.find((cp) => cp.user_id === userId);
  }

  createCustomerProfile(profile: CustomerProfile) {
    this.data.customerProfiles.push(profile);
    this.persist();
    return profile;
  }

  updateCustomerProfile(userId: string, updates: Partial<CustomerProfile>) {
    const idx = this.data.customerProfiles.findIndex((cp) => cp.user_id === userId);
    if (idx === -1) {
      // create if not exists
      const newProfile: CustomerProfile = {
        id: `cp-${Date.now()}`,
        user_id: userId,
        address: updates.address || '',
        city: updates.city || '',
        state: updates.state || '',
        postal_code: updates.postal_code || '',
        notes: updates.notes,
        created_at: new Date().toISOString(),
      };
      this.data.customerProfiles.push(newProfile);
      this.persist();
      return newProfile;
    }
    this.data.customerProfiles[idx] = {
      ...this.data.customerProfiles[idx],
      ...updates,
    };
    this.persist();
    return this.data.customerProfiles[idx];
  }

  // --- Provider Profiles ---
  getProviderProfiles() {
    return this.data.providerProfiles;
  }

  getProviderProfileById(id: string) {
    return this.data.providerProfiles.find((p) => p.id === id);
  }

  getProviderProfileByUserId(userId: string) {
    return this.data.providerProfiles.find((p) => p.user_id === userId);
  }

  createProviderProfile(profile: ProviderProfile) {
    this.data.providerProfiles.push(profile);
    this.persist();
    return profile;
  }

  updateProviderProfile(id: string, updates: Partial<ProviderProfile>) {
    const idx = this.data.providerProfiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.providerProfiles[idx] = {
      ...this.data.providerProfiles[idx],
      ...updates,
    };
    this.persist();
    return this.data.providerProfiles[idx];
  }

  updateProviderProfileByUserId(userId: string, updates: Partial<ProviderProfile>) {
    const idx = this.data.providerProfiles.findIndex((p) => p.user_id === userId);
    if (idx === -1) return null;
    this.data.providerProfiles[idx] = {
      ...this.data.providerProfiles[idx],
      ...updates,
    };
    this.persist();
    return this.data.providerProfiles[idx];
  }

  // --- Categories ---
  getCategories(onlyActive = true) {
    if (onlyActive) {
      return this.data.categories.filter((c) => c.is_active);
    }
    return this.data.categories;
  }

  getCategoryById(id: string) {
    return this.data.categories.find((c) => c.id === id);
  }

  createCategory(category: ServiceCategory) {
    this.data.categories.push(category);
    this.persist();
    return category;
  }

  updateCategory(id: string, updates: Partial<ServiceCategory>) {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = {
      ...this.data.categories[idx],
      ...updates,
    };
    this.persist();
    return this.data.categories[idx];
  }

  deleteCategory(id: string) {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Services ---
  getServices(onlyActive = true) {
    if (onlyActive) {
      return this.data.services.filter((s) => s.is_active);
    }
    return this.data.services;
  }

  getServiceById(id: string) {
    return this.data.services.find((s) => s.id === id);
  }

  getServicesByProviderId(providerId: string) {
    return this.data.services.filter((s) => s.provider_id === providerId);
  }

  getServicesByCategoryId(categoryId: string) {
    return this.data.services.filter((s) => s.category_id === categoryId && s.is_active);
  }

  createService(service: Service) {
    this.data.services.push(service);
    this.persist();
    return service;
  }

  updateService(id: string, updates: Partial<Service>) {
    const idx = this.data.services.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.services[idx] = {
      ...this.data.services[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.data.services[idx];
  }

  deleteService(id: string) {
    const idx = this.data.services.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.services.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Bookings & Double-booking Prevention ---
  getBookings() {
    return this.data.bookings;
  }

  getBookingById(id: string) {
    return this.data.bookings.find((b) => b.id === id);
  }

  getBookingsByCustomerId(customerId: string) {
    return this.data.bookings.filter((b) => b.customer_id === customerId);
  }

  getBookingsByProviderId(providerId: string) {
    return this.data.bookings.filter((b) => b.provider_id === providerId);
  }

  /**
   * Checks whether a provider is already booked for the specified date and time slot.
   * Excludes bookings that are Rejected or Cancelled.
   */
  hasDoubleBooking(providerId: string, bookingDate: string, bookingTime: string, excludeBookingId?: string): boolean {
    return this.data.bookings.some((b) => {
      if (excludeBookingId && b.id === excludeBookingId) return false;
      if (b.provider_id !== providerId) return false;
      if (b.booking_date !== bookingDate) return false;
      if (b.booking_time.trim().toLowerCase() !== bookingTime.trim().toLowerCase()) return false;
      return !['Rejected', 'Cancelled'].includes(b.status);
    });
  }

  createBooking(booking: Booking) {
    this.data.bookings.push(booking);
    this.persist();
    return booking;
  }

  updateBooking(id: string, updates: Partial<Booking>) {
    const idx = this.data.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.data.bookings[idx] = {
      ...this.data.bookings[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.data.bookings[idx];
  }

  // --- Payments ---
  getPayments() {
    return this.data.payments;
  }

  getPaymentById(id: string) {
    return this.data.payments.find((p) => p.id === id);
  }

  getPaymentByBookingId(bookingId: string) {
    return this.data.payments.find((p) => p.booking_id === bookingId);
  }

  createPayment(payment: Payment) {
    this.data.payments.push(payment);
    this.persist();
    return payment;
  }

  updatePayment(id: string, updates: Partial<Payment>) {
    const idx = this.data.payments.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.payments[idx] = {
      ...this.data.payments[idx],
      ...updates,
    };
    this.persist();
    return this.data.payments[idx];
  }

  // --- Reviews & Provider Score Aggregation ---
  getReviews() {
    return this.data.reviews;
  }

  getReviewsByServiceId(serviceId: string) {
    return this.data.reviews.filter((r) => r.service_id === serviceId);
  }

  getReviewsByProviderId(providerId: string) {
    return this.data.reviews.filter((r) => r.provider_id === providerId);
  }

  createReview(review: Review) {
    this.data.reviews.push(review);

    // Recalculate provider profile rating & count
    const providerReviews = this.getReviewsByProviderId(review.provider_id);
    const total = providerReviews.length;
    const sum = providerReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = total > 0 ? Number((sum / total).toFixed(1)) : 5.0;

    const pIdx = this.data.providerProfiles.findIndex((p) => p.id === review.provider_id);
    if (pIdx !== -1) {
      this.data.providerProfiles[pIdx].rating = avg;
      this.data.providerProfiles[pIdx].total_reviews = total;
    }

    this.persist();
    return review;
  }

  // --- Notifications ---
  getNotificationsByUserId(userId: string) {
    return this.data.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createNotification(notification: Notification) {
    this.data.notifications.push(notification);
    this.persist();
    return notification;
  }

  markNotificationRead(id: string, userId: string) {
    const notif = this.data.notifications.find((n) => n.id === id && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
      this.persist();
      return notif;
    }
    return null;
  }

  markAllNotificationsRead(userId: string) {
    let count = 0;
    this.data.notifications.forEach((n) => {
      if (n.user_id === userId && !n.is_read) {
        n.is_read = true;
        count++;
      }
    });
    if (count > 0) this.persist();
    return count;
  }

  // --- Hydration / Populated Helpers ---
  hydrateBooking(booking: Booking) {
    const service = this.getServiceById(booking.service_id);
    const category = service ? this.getCategoryById(service.category_id) : undefined;
    const providerProfile = this.getProviderProfileById(booking.provider_id);
    const providerUser = providerProfile ? this.getUserById(providerProfile.user_id) : undefined;
    const customerUser = this.getUserById(booking.customer_id);
    const payment = this.getPaymentByBookingId(booking.id);
    const review = this.data.reviews.find((r) => r.booking_id === booking.id);

    return {
      ...booking,
      service,
      category,
      provider: providerProfile
        ? {
            ...providerProfile,
            user: providerUser
              ? {
                  id: providerUser.id,
                  name: providerUser.name,
                  email: providerUser.email,
                  phone: providerUser.phone,
                  avatar_url: providerUser.avatar_url,
                }
              : undefined,
          }
        : undefined,
      customer: customerUser
        ? {
            id: customerUser.id,
            name: customerUser.name,
            email: customerUser.email,
            phone: customerUser.phone,
            avatar_url: customerUser.avatar_url,
          }
        : undefined,
      payment,
      review,
    };
  }

  hydrateService(service: Service) {
    const category = this.getCategoryById(service.category_id);
    const providerProfile = this.getProviderProfileById(service.provider_id);
    const providerUser = providerProfile ? this.getUserById(providerProfile.user_id) : undefined;
    const reviews = this.getReviewsByServiceId(service.id);

    return {
      ...service,
      category,
      provider: providerProfile
        ? {
            ...providerProfile,
            user: providerUser
              ? {
                  id: providerUser.id,
                  name: providerUser.name,
                  email: providerUser.email,
                  phone: providerUser.phone,
                  avatar_url: providerUser.avatar_url,
                }
              : undefined,
          }
        : undefined,
      reviews_count: reviews.length,
    };
  }
}

export const db = new DatabaseStore();
