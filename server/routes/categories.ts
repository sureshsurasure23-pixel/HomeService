import { Router } from 'express';
import { db } from '../db/store.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

export const categoriesRouter = Router();

// GET /api/categories
categoriesRouter.get('/', (req, res) => {
  const includeInactive = req.query.all === 'true';
  const categories = db.getCategories(!includeInactive);
  return res.json(categories);
});

// GET /api/categories/:id
categoriesRouter.get('/:id', (req, res) => {
  const category = db.getCategoryById(req.params.id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found.' });
  }
  return res.json(category);
});

// POST /api/categories (Admin only)
categoriesRouter.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { name, description, icon_name, image_url } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required.' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCat = db.createCategory({
    id: `cat-${Date.now()}`,
    name,
    slug,
    description,
    icon_name: icon_name || 'Sparkles',
    image_url: image_url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  });

  return res.status(201).json(newCat);
});

// PUT /api/categories/:id (Admin only)
categoriesRouter.put('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const category = db.getCategoryById(req.params.id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found.' });
  }

  const updated = db.updateCategory(req.params.id, req.body);
  return res.json(updated);
});

// DELETE /api/categories/:id (Admin only)
categoriesRouter.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const success = db.deleteCategory(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Category not found.' });
  }
  return res.json({ message: 'Category deleted successfully.' });
});
