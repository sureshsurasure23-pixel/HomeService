import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { db } from '../db/store.ts';
import { generateToken, requireAuth } from '../middleware/auth.ts';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'This account has been suspended by an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    let profile: any = null;
    if (user.role === 'customer') {
      profile = db.getCustomerProfileByUserId(user.id);
    } else if (user.role === 'provider') {
      profile = db.getProviderProfileByUserId(user.id);
    }

    const { password_hash, ...safeUser } = user;
    return res.json({
      token,
      user: safeUser,
      profile,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      phone,
      role = 'customer',
      // Customer specific
      address = '',
      city = '',
      state = '',
      postal_code = '',
      // Provider specific
      business_name,
      bio,
      experience_years = 1,
      hourly_rate = 35,
      category_id,
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (!['customer', 'provider'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be customer or provider.' });
    }

    if (db.getUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = `usr-${role.slice(0, 4)}-${Date.now()}`;
    const now = new Date().toISOString();

    const newUser = db.createUser({
      id: userId,
      email: email.toLowerCase(),
      password_hash,
      role,
      name,
      phone: phone || '',
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
      is_active: true,
      created_at: now,
      updated_at: now,
    });

    let profile: any = null;

    if (role === 'customer') {
      profile = db.createCustomerProfile({
        id: `cp-${Date.now()}`,
        user_id: userId,
        address,
        city,
        state,
        postal_code,
        created_at: now,
      });
    } else if (role === 'provider') {
      profile = db.createProviderProfile({
        id: `pp-${Date.now()}`,
        user_id: userId,
        business_name: business_name || `${name}'s Services`,
        bio: bio || 'Professional service provider committed to top tier customer satisfaction.',
        experience_years: Number(experience_years) || 1,
        hourly_rate: Number(hourly_rate) || 35,
        rating: 5.0,
        total_reviews: 0,
        is_approved: true, // auto-approve for testing or admin can suspend
        is_available: true,
        address: address || 'City Center',
        city: city || 'Metro City',
        id_verified: true,
        category_id: category_id || 'cat-1',
        created_at: now,
      });
    }

    // Welcome notification
    db.createNotification({
      id: `notif-${Date.now()}`,
      user_id: userId,
      title: 'Welcome to ProServe!',
      message: `Your ${role} account has been created successfully. Explore verified services and manage bookings.`,
      type: 'system',
      is_read: false,
      link_url: role === 'provider' ? '/provider/dashboard' : '/customer/dashboard',
      created_at: now,
    });

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const { password_hash: _, ...safeUser } = newUser;
    return res.status(201).json({
      token,
      user: safeUser,
      profile,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, (req, res) => {
  const user = db.getUserById(req.user!.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  let profile: any = null;
  if (user.role === 'customer') {
    profile = db.getCustomerProfileByUserId(user.id);
  } else if (user.role === 'provider') {
    profile = db.getProviderProfileByUserId(user.id);
  }

  const { password_hash, ...safeUser } = user;
  return res.json({
    user: safeUser,
    profile,
  });
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    // For security, still return success message
    return res.json({
      message: 'If that email exists in our system, a password reset link has been dispatched.',
    });
  }

  return res.json({
    message: 'Password reset link sent! (Demo mode: reset token generated for testing).',
    reset_token: `rst-${Date.now()}`,
  });
});
