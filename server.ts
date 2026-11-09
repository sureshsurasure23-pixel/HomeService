import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { adminRouter } from './server/routes/admin.ts';
import { authRouter } from './server/routes/auth.ts';
import { bookingsRouter } from './server/routes/bookings.ts';
import { categoriesRouter } from './server/routes/categories.ts';
import { notificationsRouter } from './server/routes/notifications.ts';
import { paymentsRouter } from './server/routes/payments.ts';
import { providersRouter } from './server/routes/providers.ts';
import { reviewsRouter } from './server/routes/reviews.ts';
import { servicesRouter } from './server/routes/services.ts';
import { usersRouter } from './server/routes/users.ts';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ProServe Service Marketplace API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/services', servicesRouter);
app.use('/api/providers', providersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);

// Global Error Handler for API
app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ProServe] Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Startup Error]', err);
});
