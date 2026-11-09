import { Router } from 'express';
import { BookingStatus } from '../db/schema.ts';
import { db } from '../db/store.ts';
import { requireAuth } from '../middleware/auth.ts';

export const bookingsRouter = Router();

// GET /api/bookings
bookingsRouter.get('/', requireAuth, (req, res) => {
  const { role, userId } = req.user!;
  const { status } = req.query;

  let bookings = db.getBookings();

  if (role === 'customer') {
    bookings = db.getBookingsByCustomerId(userId);
  } else if (role === 'provider') {
    const provider = db.getProviderProfileByUserId(userId);
    if (!provider) {
      return res.json([]);
    }
    bookings = db.getBookingsByProviderId(provider.id);
  }
  // Admin sees all bookings

  if (status && typeof status === 'string') {
    bookings = bookings.filter((b) => b.status === status);
  }

  // Hydrate each booking with related entities
  const hydrated = bookings
    .map((b) => db.hydrateBooking(b))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return res.json(hydrated);
});

// GET /api/bookings/:id
bookingsRouter.get('/:id', requireAuth, (req, res) => {
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const { role, userId } = req.user!;
  if (role === 'customer' && booking.customer_id !== userId) {
    return res.status(403).json({ error: 'Access denied.' });
  } else if (role === 'provider') {
    const provider = db.getProviderProfileByUserId(userId);
    if (!provider || provider.id !== booking.provider_id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
  }

  return res.json(db.hydrateBooking(booking));
});

// POST /api/bookings/check-availability
bookingsRouter.post('/check-availability', (req, res) => {
  const { provider_id, booking_date, booking_time } = req.body;
  if (!provider_id || !booking_date || !booking_time) {
    return res.status(400).json({ error: 'Provider, date, and time slot are required.' });
  }

  const isDoubleBooked = db.hasDoubleBooking(provider_id, booking_date, booking_time);
  return res.json({
    available: !isDoubleBooked,
    message: isDoubleBooked
      ? 'This provider already has a confirmed or pending booking at this date and time.'
      : 'Time slot is available for booking!',
  });
});

// POST /api/bookings (Customer only)
bookingsRouter.post('/', requireAuth, (req, res) => {
  if (req.user!.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can book services.' });
  }

  const { service_id, booking_date, booking_time, location_address, city, requirements } = req.body;

  if (!service_id || !booking_date || !booking_time || !location_address || !city) {
    return res.status(400).json({ error: 'Please fill in all required booking details.' });
  }

  const service = db.getServiceById(service_id);
  if (!service || !service.is_active) {
    return res.status(404).json({ error: 'Service is currently unavailable.' });
  }

  const provider = db.getProviderProfileById(service.provider_id);
  if (!provider || !provider.is_available) {
    return res.status(400).json({ error: 'This service provider is currently marked as unavailable.' });
  }

  // DOUBLE BOOKING CHECK
  if (db.hasDoubleBooking(service.provider_id, booking_date, booking_time)) {
    return res.status(409).json({
      error: `Double Booking Conflict: Provider is already booked on ${booking_date} at ${booking_time}. Please select an alternate date or time slot.`,
    });
  }

  const now = new Date().toISOString();
  const bookingNumber = `BK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const newBooking = db.createBooking({
    id: `bk-${Date.now()}`,
    booking_number: bookingNumber,
    customer_id: req.user!.userId,
    provider_id: service.provider_id,
    service_id,
    booking_date,
    booking_time,
    location_address,
    city,
    requirements: requirements || '',
    status: 'Pending',
    created_at: now,
    updated_at: now,
  });

  // Notify Provider
  const customer = db.getUserById(req.user!.userId);
  db.createNotification({
    id: `notif-${Date.now()}-prov`,
    user_id: provider.user_id,
    title: 'New Booking Request Received',
    message: `${customer?.name || 'A customer'} requested "${service.title}" on ${booking_date} at ${booking_time}.`,
    type: 'booking',
    is_read: false,
    link_url: `/provider/requests`,
    created_at: now,
  });

  // Notify Customer
  db.createNotification({
    id: `notif-${Date.now()}-cust`,
    user_id: req.user!.userId,
    title: 'Booking Submitted',
    message: `Your booking for "${service.title}" (${bookingNumber}) has been sent to ${provider.business_name}.`,
    type: 'booking',
    is_read: false,
    link_url: `/customer/bookings`,
    created_at: now,
  });

  return res.status(201).json(db.hydrateBooking(newBooking));
});

// PUT /api/bookings/:id/status
bookingsRouter.put('/:id/status', requireAuth, (req, res) => {
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const { status, reason } = req.body as { status: BookingStatus; reason?: string };
  const validStatuses: BookingStatus[] = [
    'Pending',
    'Accepted',
    'Rejected',
    'Confirmed',
    'In Progress',
    'Completed',
    'Cancelled',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status: ${status}` });
  }

  const { role, userId } = req.user!;
  const provider = db.getProviderProfileById(booking.provider_id);

  // Authorization checks per role
  if (role === 'customer') {
    if (booking.customer_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    // Customer can only cancel if eligible
    if (status !== 'Cancelled') {
      return res.status(403).json({ error: 'Customers can only cancel bookings.' });
    }
    if (!['Pending', 'Accepted', 'Confirmed'].includes(booking.status)) {
      return res.status(400).json({
        error: `Cannot cancel a booking that is currently '${booking.status}'.`,
      });
    }
  } else if (role === 'provider') {
    if (!provider || provider.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    // Provider can Accept, Reject, start (In Progress), Complete
    const providerAllowed: BookingStatus[] = ['Accepted', 'Rejected', 'In Progress', 'Completed'];
    if (!providerAllowed.includes(status)) {
      return res.status(403).json({
        error: `Providers can only set status to: ${providerAllowed.join(', ')}`,
      });
    }
  }
  // Admin can change to any valid status

  const updated = db.updateBooking(booking.id, {
    status,
    cancellation_reason: reason || booking.cancellation_reason,
  });

  const now = new Date().toISOString();

  // Create notifications based on transition
  if (provider) {
    if (role === 'customer' && status === 'Cancelled') {
      db.createNotification({
        id: `notif-${Date.now()}-cancel`,
        user_id: provider.user_id,
        title: 'Booking Cancelled',
        message: `Booking #${booking.booking_number} was cancelled by the customer.${reason ? ' Reason: ' + reason : ''}`,
        type: 'booking',
        is_read: false,
        created_at: now,
      });
    } else if (role === 'provider') {
      db.createNotification({
        id: `notif-${Date.now()}-status`,
        user_id: booking.customer_id,
        title: `Booking Update: ${status}`,
        message: `Your booking #${booking.booking_number} status has been updated to "${status}".`,
        type: 'booking',
        is_read: false,
        link_url: `/customer/bookings`,
        created_at: now,
      });
    }
  }

  return res.json(db.hydrateBooking(updated!));
});
