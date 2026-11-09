import { Router } from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from '../middleware/auth.ts';

export const usersRouter = Router();

// GET /api/users/profile
usersRouter.get('/profile', requireAuth, (req, res) => {
  const user = db.getUserById(req.user!.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  let profile = null;
  if (user.role === 'customer') {
    profile = db.getCustomerProfileByUserId(user.id);
  } else if (user.role === 'provider') {
    profile = db.getProviderProfileByUserId(user.id);
  }

  const { password_hash, ...safeUser } = user;
  return res.json({ user: safeUser, profile });
});

// PUT /api/users/profile
usersRouter.put('/profile', requireAuth, (req, res) => {
  const { name, phone, avatar_url, ...profileUpdates } = req.body;
  const userId = req.user!.userId;

  const userUpdates: any = {};
  if (name) userUpdates.name = name;
  if (phone !== undefined) userUpdates.phone = phone;
  if (avatar_url !== undefined) userUpdates.avatar_url = avatar_url;

  const updatedUser = db.updateUser(userId, userUpdates);

  let updatedProfile = null;
  if (req.user!.role === 'customer') {
    updatedProfile = db.updateCustomerProfile(userId, profileUpdates);
  } else if (req.user!.role === 'provider') {
    updatedProfile = db.updateProviderProfileByUserId(userId, profileUpdates);
  }

  const { password_hash, ...safeUser } = updatedUser || db.getUserById(userId)!;
  return res.json({
    user: safeUser,
    profile: updatedProfile,
  });
});

// GET /api/users/provider/stats
usersRouter.get('/provider/stats', requireAuth, (req, res) => {
  if (req.user!.role !== 'provider') {
    return res.status(403).json({ error: 'Only providers can access provider statistics.' });
  }

  const provider = db.getProviderProfileByUserId(req.user!.userId);
  if (!provider) {
    return res.status(404).json({ error: 'Provider profile not found.' });
  }

  const services = db.getServicesByProviderId(provider.id);
  const bookings = db.getBookingsByProviderId(provider.id);
  const reviews = db.getReviewsByProviderId(provider.id);
  const payments = db.getPayments().filter((p) => {
    const booking = bookings.find((b) => b.id === p.booking_id);
    return booking && p.payment_status === 'Completed';
  });

  const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingRequests = bookings.filter((b) => b.status === 'Pending').length;
  const completedJobs = bookings.filter((b) => b.status === 'Completed').length;
  const inProgressJobs = bookings.filter((b) => b.status === 'In Progress' || b.status === 'Accepted').length;

  return res.json({
    metrics: {
      servicesCount: services.length,
      totalBookings: bookings.length,
      pendingRequests,
      completedJobs,
      inProgressJobs,
      totalEarnings,
      rating: provider.rating,
      totalReviews: provider.total_reviews,
      isAvailable: provider.is_available,
      isApproved: provider.is_approved,
    },
    recentBookings: bookings
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((b) => db.hydrateBooking(b)),
  });
});
