import { Router } from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from '../middleware/auth.ts';

export const notificationsRouter = Router();

// GET /api/notifications
notificationsRouter.get('/', requireAuth, (req, res) => {
  const notifs = db.getNotificationsByUserId(req.user!.userId);
  return res.json(notifs);
});

// PUT /api/notifications/:id/read
notificationsRouter.put('/:id/read', requireAuth, (req, res) => {
  const notif = db.markNotificationRead(req.params.id, req.user!.userId);
  if (!notif) {
    return res.status(404).json({ error: 'Notification not found.' });
  }
  return res.json(notif);
});

// PUT /api/notifications/read-all
notificationsRouter.put('/read-all', requireAuth, (req, res) => {
  const count = db.markAllNotificationsRead(req.user!.userId);
  return res.json({ updated: count });
});
