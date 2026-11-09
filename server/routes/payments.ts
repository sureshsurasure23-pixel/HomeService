import { Router } from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from '../middleware/auth.ts';

export const paymentsRouter = Router();

// GET /api/payments
paymentsRouter.get('/', requireAuth, (req, res) => {
  const { role, userId } = req.user!;
  let payments = db.getPayments();

  if (role === 'customer') {
    payments = payments.filter((p) => p.customer_id === userId);
  } else if (role === 'provider') {
    const provider = db.getProviderProfileByUserId(userId);
    if (!provider) return res.json([]);
    const myBookingIds = new Set(db.getBookingsByProviderId(provider.id).map((b) => b.id));
    payments = payments.filter((p) => myBookingIds.has(p.booking_id));
  }
  // Admin sees all

  const hydrated = payments
    .map((p) => {
      const booking = db.getBookingById(p.booking_id);
      const service = booking ? db.getServiceById(booking.service_id) : undefined;
      const customer = db.getUserById(p.customer_id);
      return {
        ...p,
        booking,
        service,
        customer: customer
          ? {
              id: customer.id,
              name: customer.name,
              email: customer.email,
            }
          : undefined,
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return res.json(hydrated);
});

// POST /api/payments/process
paymentsRouter.post('/process', requireAuth, (req, res) => {
  const { booking_id, payment_method, simulate_failure } = req.body;

  if (!booking_id || !payment_method) {
    return res.status(400).json({ error: 'booking_id and payment_method are required.' });
  }

  const booking = db.getBookingById(booking_id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (booking.customer_id !== req.user!.userId && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to pay for this booking.' });
  }

  const service = db.getServiceById(booking.service_id);
  const amount = service ? service.price : 100;

  // Check if existing payment exists
  const existing = db.getPaymentByBookingId(booking_id);
  if (existing && existing.payment_status === 'Completed') {
    return res.status(400).json({ error: 'This booking has already been paid for.' });
  }

  const now = new Date().toISOString();

  if (simulate_failure) {
    const failedPayment = db.createPayment({
      id: `pay-${Date.now()}`,
      booking_id,
      customer_id: req.user!.userId,
      amount,
      payment_method,
      payment_status: 'Failed',
      transaction_id: `TXN-FAIL-${Math.floor(100000 + Math.random() * 900000)}`,
      gateway: payment_method === 'Online Payment' ? 'Razorpay Test Gateway' : 'Manual',
      created_at: now,
    });
    return res.status(400).json({
      error: 'Payment failed at gateway. Please try again with valid credentials or select Cash on Service.',
      payment: failedPayment,
    });
  }

  let transactionId = '';
  let paymentStatus: 'Pending' | 'Completed' = 'Pending';
  let gatewayName = '';

  if (payment_method === 'Cash on Service') {
    transactionId = `TXN-CASH-${Math.floor(100000 + Math.random() * 900000)}`;
    paymentStatus = 'Pending'; // Cash collected upon service delivery
    gatewayName = 'Cash on Delivery (Pay in Person)';
  } else {
    // Online Payment via Razorpay Test Gateway simulator
    transactionId = `TXN-RAZOR-TEST-${Math.floor(100000 + Math.random() * 900000)}`;
    paymentStatus = 'Completed';
    gatewayName = 'Razorpay Test Gateway (Authorized & Verified)';

    // Also update booking status to Confirmed if was Pending or Accepted
    if (booking.status === 'Pending' || booking.status === 'Accepted') {
      db.updateBooking(booking.id, { status: 'Confirmed' });
    }
  }

  let paymentRecord;
  if (existing) {
    paymentRecord = db.updatePayment(existing.id, {
      payment_method,
      payment_status: paymentStatus,
      transaction_id: transactionId,
      gateway: gatewayName,
    });
  } else {
    paymentRecord = db.createPayment({
      id: `pay-${Date.now()}`,
      booking_id,
      customer_id: req.user!.userId,
      amount,
      payment_method,
      payment_status: paymentStatus,
      transaction_id: transactionId,
      gateway: gatewayName,
      created_at: now,
    });
  }

  // Notify customer
  db.createNotification({
    id: `notif-${Date.now()}-pay`,
    user_id: req.user!.userId,
    title: paymentStatus === 'Completed' ? 'Payment Successful' : 'Payment Method Saved',
    message:
      paymentStatus === 'Completed'
        ? `Payment of ₹${amount} received via ${gatewayName}. Transaction: ${transactionId}`
        : `Booking #${booking.booking_number} set to Cash on Service. Amount due: ₹${amount}`,
    type: 'payment',
    is_read: false,
    link_url: `/customer/payments`,
    created_at: now,
  });

  return res.json({
    success: true,
    payment: paymentRecord,
    booking: db.hydrateBooking(db.getBookingById(booking.id)!),
  });
});
