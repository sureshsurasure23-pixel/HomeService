import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/store.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'proserve-marketplace-jwt-secret-key-2026';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: 'customer' | 'provider' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Missing or invalid Bearer token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    const user = db.getUserById(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User account not found or suspended.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    const user = db.getUserById(decoded.userId);
    if (user && user.is_active) {
      req.user = decoded;
    }
  } catch (err) {
    // Ignore invalid optional token
  }
  next();
}

export function requireRole(...allowedRoles: Array<'customer' | 'provider' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' is not authorized for this action. Required: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}
