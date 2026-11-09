import { Router } from 'express';
import { db } from '../db/store.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

export const adminRouter = Router();

// Apply admin guard to all admin routes
adminRouter.use(requireAuth, requireRole('admin'));

// GET /api/admin/stats
adminRouter.get('/stats', (req, res) => {
  const users = db.getUsers();
  const customers = users.filter((u) => u.role === 'customer');
  const providers = users.filter((u) => u.role === 'provider');
  const services = db.getServices(false);
  const bookings = db.getBookings();
  const payments = db.getPayments();
  const categories = db.getCategories(false);
  const reviews = db.getReviews();

  const totalRevenue = payments
    .filter((p) => p.payment_status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  // Status breakdown
  const statusCounts: Record<string, number> = {
    Pending: 0,
    Accepted: 0,
    Rejected: 0,
    Confirmed: 0,
    'In Progress': 0,
    Completed: 0,
    Cancelled: 0,
  };

  bookings.forEach((b) => {
    if (statusCounts[b.status] !== undefined) {
      statusCounts[b.status]++;
    }
  });

  // Category breakdown
  const categoryStats = categories.map((c) => {
    const catServices = services.filter((s) => s.category_id === c.id);
    const catServiceIds = new Set(catServices.map((s) => s.id));
    const catBookings = bookings.filter((b) => catServiceIds.has(b.service_id));
    return {
      id: c.id,
      name: c.name,
      servicesCount: catServices.length,
      bookingsCount: catBookings.length,
    };
  });

  // Recent 6 bookings
  const recentBookings = bookings
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .map((b) => db.hydrateBooking(b));

  return res.json({
    metrics: {
      totalCustomers: customers.length,
      totalProviders: providers.length,
      totalServices: services.length,
      totalBookings: bookings.length,
      totalRevenue,
      totalReviews: reviews.length,
      totalCategories: categories.length,
    },
    statusCounts,
    categoryStats,
    recentBookings,
  });
});

// GET /api/admin/users
adminRouter.get('/users', (req, res) => {
  const { role } = req.query;
  let users = db.getUsers();

  if (role && typeof role === 'string') {
    users = users.filter((u) => u.role === role);
  }

  const enriched = users.map((u) => {
    let profile = null;
    if (u.role === 'customer') {
      profile = db.getCustomerProfileByUserId(u.id);
    } else if (u.role === 'provider') {
      profile = db.getProviderProfileByUserId(u.id);
    }
    const { password_hash, ...safeUser } = u;
    return {
      ...safeUser,
      profile,
    };
  });

  return res.json(enriched);
});

// PUT /api/admin/users/:id/status (Toggle activate / suspend)
adminRouter.put('/users/:id/status', (req, res) => {
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active boolean is required.' });
  }

  const updated = db.updateUser(req.params.id, { is_active });
  if (!updated) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const { password_hash, ...safeUser } = updated;
  return res.json(safeUser);
});
