import { Router } from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from '../middleware/auth.ts';

export const reviewsRouter = Router();

// GET /api/reviews
reviewsRouter.get('/', (req, res) => {
  const { service_id, provider_id, customer_id } = req.query;
  let reviews = db.getReviews();

  if (service_id) {
    reviews = reviews.filter((r) => r.service_id === service_id);
  }
  if (provider_id) {
    reviews = reviews.filter((r) => r.provider_id === provider_id);
  }
  if (customer_id) {
    reviews = reviews.filter((r) => r.customer_id === customer_id);
  }

  const hydrated = reviews
    .map((r) => {
      const customer = db.getUserById(r.customer_id);
      const service = db.getServiceById(r.service_id);
      const provider = db.getProviderProfileById(r.provider_id);
      return {
        ...r,
        customer: customer
          ? {
              name: customer.name,
              avatar_url: customer.avatar_url,
            }
          : undefined,
        service: service
          ? {
              id: service.id,
              title: service.title,
            }
          : undefined,
        provider: provider
          ? {
              business_name: provider.business_name,
            }
          : undefined,
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return res.json(hydrated);
});

// POST /api/reviews
reviewsRouter.post('/', requireAuth, (req, res) => {
  if (req.user!.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can submit reviews.' });
  }

  const { booking_id, rating, comment } = req.body;

  if (!booking_id || !rating || !comment) {
    return res.status(400).json({ error: 'booking_id, rating (1-5), and comment are required.' });
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
  }

  const booking = db.getBookingById(booking_id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (booking.customer_id !== req.user!.userId) {
    return res.status(403).json({ error: 'You can only review your own bookings.' });
  }

  if (booking.status !== 'Completed') {
    return res.status(400).json({ error: 'You can only submit a review once the service has been marked as Completed.' });
  }

  const existingReview = db.getReviews().find((r) => r.booking_id === booking_id);
  if (existingReview) {
    return res.status(409).json({ error: 'You have already submitted a review for this booking.' });
  }

  const now = new Date().toISOString();
  const newReview = db.createReview({
    id: `rev-${Date.now()}`,
    booking_id,
    customer_id: req.user!.userId,
    provider_id: booking.provider_id,
    service_id: booking.service_id,
    rating: numericRating,
    comment,
    created_at: now,
  });

  // Notify Provider
  const provider = db.getProviderProfileById(booking.provider_id);
  if (provider) {
    db.createNotification({
      id: `notif-${Date.now()}-rev`,
      user_id: provider.user_id,
      title: 'New Customer Review Received',
      message: `A customer left a ${numericRating}★ review: "${comment.slice(0, 60)}..."`,
      type: 'review',
      is_read: false,
      link_url: `/provider/reviews`,
      created_at: now,
    });
  }

  const customer = db.getUserById(req.user!.userId);
  return res.status(201).json({
    ...newReview,
    customer: customer
      ? {
          name: customer.name,
          avatar_url: customer.avatar_url,
        }
      : undefined,
  });
});
