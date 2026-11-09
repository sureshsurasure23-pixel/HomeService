import { Router } from 'express';
import { db } from '../db/store.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

export const servicesRouter = Router();

// GET /api/services
servicesRouter.get('/', (req, res) => {
  const { category_id, provider_id, search, min_price, max_price, sort_by } = req.query;

  let services = db.getServices(true);

  if (category_id) {
    services = services.filter((s) => s.category_id === category_id);
  }

  if (provider_id) {
    services = services.filter((s) => s.provider_id === provider_id);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    services = services.filter((s) => {
      const titleMatch = s.title.toLowerCase().includes(q);
      const descMatch = s.description.toLowerCase().includes(q);
      const cat = db.getCategoryById(s.category_id);
      const catMatch = cat ? cat.name.toLowerCase().includes(q) : false;
      return titleMatch || descMatch || catMatch;
    });
  }

  if (min_price) {
    services = services.filter((s) => s.price >= Number(min_price));
  }

  if (max_price) {
    services = services.filter((s) => s.price <= Number(max_price));
  }

  // Hydrate with category, provider, reviews_count
  let hydrated = services.map((s) => db.hydrateService(s));

  if (sort_by === 'price-asc') {
    hydrated.sort((a, b) => a.price - b.price);
  } else if (sort_by === 'price-desc') {
    hydrated.sort((a, b) => b.price - a.price);
  } else if (sort_by === 'rating') {
    hydrated.sort((a, b) => (b.provider?.rating || 0) - (a.provider?.rating || 0));
  } else {
    // Newest first
    hydrated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return res.json(hydrated);
});

// GET /api/services/suggestions
servicesRouter.get('/suggestions', (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string' || !q.trim()) {
    return res.json({ categories: [], services: [] });
  }

  const query = q.toLowerCase().trim();

  // Match categories by name or description
  const categories = db
    .getCategories(true)
    .filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
    )
    .slice(0, 4);

  // Match services by title, description, or category name
  const services = db
    .getServices(true)
    .filter((s) => {
      const titleMatch = s.title.toLowerCase().includes(query);
      const descMatch = s.description.toLowerCase().includes(query);
      const cat = db.getCategoryById(s.category_id);
      const catMatch = cat ? cat.name.toLowerCase().includes(query) : false;
      return titleMatch || descMatch || catMatch;
    })
    .slice(0, 6)
    .map((s) => db.hydrateService(s));

  return res.json({ categories, services });
});

// GET /api/services/:id
servicesRouter.get('/:id', (req, res) => {
  const service = db.getServiceById(req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found.' });
  }

  const hydrated = db.hydrateService(service);
  const reviews = db.getReviewsByServiceId(service.id).map((r) => {
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

  // Related services in same category
  const related = db
    .getServicesByCategoryId(service.category_id)
    .filter((s) => s.id !== service.id)
    .slice(0, 3)
    .map((s) => db.hydrateService(s));

  return res.json({
    ...hydrated,
    reviews,
    related,
  });
});

// POST /api/services (Provider only)
servicesRouter.post('/', requireAuth, requireRole('provider'), (req, res) => {
  const provider = db.getProviderProfileByUserId(req.user!.userId);
  if (!provider) {
    return res.status(403).json({ error: 'Only registered providers can create services.' });
  }

  if (!provider.is_approved) {
    return res.status(403).json({ error: 'Your provider account is pending approval by the administrator.' });
  }

  const { title, description, category_id, price, duration_mins, image_url, features } = req.body;

  if (!title || !description || !category_id || !price) {
    return res.status(400).json({ error: 'Title, description, category, and price are required.' });
  }

  const now = new Date().toISOString();
  const newService = db.createService({
    id: `srv-${Date.now()}`,
    provider_id: provider.id,
    category_id,
    title,
    description,
    price: Number(price),
    duration_mins: Number(duration_mins) || 60,
    image_url:
      image_url ||
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    features: Array.isArray(features) ? features : [],
    is_active: true,
    created_at: now,
    updated_at: now,
  });

  return res.status(201).json(db.hydrateService(newService));
});

// PUT /api/services/:id (Provider owner or Admin)
servicesRouter.put('/:id', requireAuth, (req, res) => {
  const service = db.getServiceById(req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found.' });
  }

  if (req.user!.role !== 'admin') {
    const provider = db.getProviderProfileByUserId(req.user!.userId);
    if (!provider || provider.id !== service.provider_id) {
      return res.status(403).json({ error: 'You are not authorized to edit this service.' });
    }
  }

  const updated = db.updateService(req.params.id, req.body);
  return res.json(db.hydrateService(updated!));
});

// DELETE /api/services/:id (Provider owner or Admin)
servicesRouter.delete('/:id', requireAuth, (req, res) => {
  const service = db.getServiceById(req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found.' });
  }

  if (req.user!.role !== 'admin') {
    const provider = db.getProviderProfileByUserId(req.user!.userId);
    if (!provider || provider.id !== service.provider_id) {
      return res.status(403).json({ error: 'You are not authorized to delete this service.' });
    }
  }

  db.deleteService(req.params.id);
  return res.json({ message: 'Service removed successfully.' });
});
