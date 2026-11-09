import { Router } from 'express';
import { db } from '../db/store.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

export const providersRouter = Router();

// GET /api/providers
providersRouter.get('/', (req, res) => {
  const { category_id, city, search, all } = req.query;

  let profiles = db.getProviderProfiles();

  if (all !== 'true') {
    profiles = profiles.filter((p) => p.is_approved);
  }

  if (category_id) {
    profiles = profiles.filter((p) => p.category_id === category_id);
  }

  if (city && typeof city === 'string') {
    profiles = profiles.filter((p) => p.city.toLowerCase().includes(city.toLowerCase()));
  }

  const hydrated = profiles.map((p) => {
    const user = db.getUserById(p.user_id);
    const category = db.getCategoryById(p.category_id);
    const services = db.getServicesByProviderId(p.id);

    return {
      ...p,
      category,
      services_count: services.length,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar_url: user.avatar_url,
          }
        : undefined,
    };
  });

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    return res.json(
      hydrated.filter(
        (p) =>
          p.business_name.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q) ||
          (p.user?.name && p.user.name.toLowerCase().includes(q))
      )
    );
  }

  return res.json(hydrated);
});

// GET /api/providers/:id
providersRouter.get('/:id', (req, res) => {
  const profile = db.getProviderProfileById(req.params.id);
  if (!profile) {
    return res.status(404).json({ error: 'Provider not found.' });
  }

  const user = db.getUserById(profile.user_id);
  const category = db.getCategoryById(profile.category_id);
  const services = db.getServicesByProviderId(profile.id).map((s) => db.hydrateService(s));
  const reviews = db.getReviewsByProviderId(profile.id).map((r) => {
    const customer = db.getUserById(r.customer_id);
    return {
      ...r,
      customer: customer
        ? {
            name: customer.name,
            avatar_url: customer.avatar_url,
          }
        : undefined,
    };
  });

  return res.json({
    ...profile,
    category,
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar_url: user.avatar_url,
        }
      : undefined,
    services,
    reviews,
  });
});

// PUT /api/providers/:id/status (Admin only: approve or suspend)
providersRouter.put('/:id/status', requireAuth, requireRole('admin'), (req, res) => {
  const { is_approved } = req.body;
  if (typeof is_approved !== 'boolean') {
    return res.status(400).json({ error: 'is_approved boolean is required.' });
  }

  const updated = db.updateProviderProfile(req.params.id, { is_approved });
  if (!updated) {
    return res.status(404).json({ error: 'Provider not found.' });
  }

  // Notify provider
  db.createNotification({
    id: `notif-${Date.now()}`,
    user_id: updated.user_id,
    title: is_approved ? 'Profile Approved!' : 'Profile Status Update',
    message: is_approved
      ? 'Congratulations! Your service provider profile has been verified and approved.'
      : 'Your service provider profile has been suspended by the platform administrator.',
    type: 'system',
    is_read: false,
    created_at: new Date().toISOString(),
  });

  return res.json(updated);
});

// PUT /api/providers/availability (Provider toggle availability)
providersRouter.put('/availability/toggle', requireAuth, requireRole('provider'), (req, res) => {
  const profile = db.getProviderProfileByUserId(req.user!.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Provider profile not found.' });
  }

  const newStatus = !profile.is_available;
  const updated = db.updateProviderProfile(profile.id, { is_available: newStatus });
  return res.json({ is_available: updated?.is_available });
});
