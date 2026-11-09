# ProServe - Full Stack Service Marketplace Web Application

An enterprise-grade, on-demand Service Marketplace connecting customers with verified professional service providers across 15 specialized categories. Featuring real-time slot booking with double-booking prevention, role-based workflows (Customer, Provider, Administrator), Razorpay test mode & Cash on Service payment processing, verified ratings & reviews, and analytics dashboards.

---

## 1. Project Objectives
- **Customer Enablement**: Real-time discovery, search & filtering across 15+ home & commercial service categories, instant slot reservation, guaranteed double-booking prevention, multi-method payment, and verified feedback submission.
- **Provider Empowerment**: Dynamic profile & credential verification, custom service catalogue management with feature lists & pricing, real-time availability toggling, incoming booking acceptance/rejection workflows, and transparent earnings tracking.
- **Administrative Governance**: Platform oversight, total customer and provider management with instant suspension/approval controls, dynamic service category expansion, global booking status override, and financial audit logs.

---

## 2. Technology Stack

### Frontend
- **React 19 (TypeScript)**: Modular component architecture with functional hooks.
- **Tailwind CSS v4**: Modern dark-slate aesthetic with responsive layouts and glassmorphism.
- **Lucide React Icons**: Scalable iconography for all 15 categories and system actions.
- **Canvas Confetti**: Celebratory payment & booking confirmation animations.
- **Motion**: Fluid transitions and micro-interactions.

### Full-Stack Runtime & Backend
- **Node.js (v22) + Express.js**: RESTful API endpoints mounted seamlessly alongside Vite dev middleware.
- **JSON File-Backed Relational Storage (`/data/marketplace_db.json`)**: ACID-style persistent database with relational schemas, foreign key hydration, and auto-seeding.
- **JWT Authentication & bcryptjs**: Secure password hashing with 10 salt rounds and 7-day signed JWT tokens.
- **Django 5 Reference Backend (`/backend/`)**: Complete Python Django + Django REST Framework reference codebase with models, serializers, views, and urls.

---

## 3. Seeded Test Credentials (1-Click Switch Available in Navbar)

The app comes pre-seeded with verified test accounts across all three roles:

| Role | Email | Password | Access & Features |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@proserve.com` | `admin123` | Full dashboard, category creation/editing, provider approvals, user suspension, financial ledger |
| **Service Provider** | `provider@proserve.com` | `provider123` | Provider dashboard, availability switch, booking requests (Accept/Reject/In Progress/Complete), service catalogue |
| **Customer** | `customer@proserve.com` | `customer123` | Browse catalog, book services, pay online or cash, cancel bookings, submit reviews |

*(Tip: In the top right navigation bar, click the **"Test Role"** button to switch accounts instantly without typing passwords!)*

---

## 4. The 15 Default Service Categories

1. **Home Cleaning**: Deep cleaning, sanitization, kitchen, bathroom, and villa care.
2. **Plumbing**: Leak repairs, pipe coupling, drain unblocking, and water heaters.
3. **Electrical Services**: Short circuit diagnostics, wiring, breakers, smart home switches.
4. **AC Repair**: Air conditioning maintenance, gas refilling, filter deep cleaning.
5. **Painting**: Interior wall coats, exterior waterproofing, texture painting.
6. **Carpentry**: Custom cabinetry, furniture assembly, hinge & door repairs.
7. **Beauty and Salon**: At-home haircuts, facials, waxing, manicures, and styling.
8. **Computer & Laptop Repair**: Hardware diagnostics, OS recovery, screen replacements.
9. **Photography**: Weddings, corporate portraits, real estate, and lifestyle imagery.
10. **Event Management**: Celebrations, stage setup, catering coordination.
11. **Fitness Training**: Personal coaching, strength training, yoga, nutrition.
12. **Home Tuition**: STEM subjects, coding, language arts, and test prep.
13. **Pest Control**: Termite treatment, bedbug extermination, eco-friendly fogging.
14. **Vehicle Repair**: Mobile car mechanic, jumpstarts, brakes, diagnostic scan.
15. **Gardening**: Lawn mowing, tree trimming, landscape design, irrigation.

---

## 5. Booking & Payment Lifecycle

1. **Selection & Availability**: The customer selects a service and preferred date & time slot. The backend checks `/api/bookings/check-availability` to guarantee the provider has no active bookings for that slot.
2. **Double Booking Prevention**: Attempting to book a slot already occupied returns an HTTP `409 Conflict` with a clear explanation.
3. **Booking Submission**: Saved in `Pending` state; provider receives an in-app notification.
4. **Provider Response**: Provider accepts (`Accepted`) or rejects with reason (`Rejected`).
5. **Payment Processing**:
   - **Online Payment (Razorpay Test Mode)**: Simulates authorization and generates a verified transaction ID (`TXN-RAZOR-TEST-...`), instantly setting status to `Confirmed`.
   - **Cash on Service**: Records `TXN-CASH-...` with `Pending` payment status, due on delivery.
6. **Service Delivery**: Provider transitions status to `In Progress` upon arrival, and `Completed` when finished.
7. **Review & Rating**: Once completed, the customer submits a 1-5 star review with feedback. Provider average rating is automatically recalculated.

---

## 6. REST API Documentation

### Auth
- `POST /api/auth/register` - Register customer or provider
- `POST /api/auth/login` - Authenticate with email and password
- `GET /api/auth/me` - Get current session and profile
- `POST /api/auth/forgot-password` - Request password reset

### Categories & Services
- `GET /api/categories` - List categories
- `POST /api/categories` - Create new category (Admin only)
- `PUT /api/categories/:id` - Edit category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)
- `GET /api/services` - Search & filter services (`category_id`, `search`, `min_price`, `max_price`, `sort_by`)
- `POST /api/services` - Add service (Provider only)
- `PUT /api/services/:id` - Edit service
- `DELETE /api/services/:id` - Delete service

### Bookings & Payments
- `GET /api/bookings` - List role-filtered bookings
- `POST /api/bookings` - Create booking (Customer only, with double-booking check)
- `POST /api/bookings/check-availability` - Live slot check
- `PUT /api/bookings/:id/status` - Transition booking state
- `GET /api/payments` - Transaction ledger
- `POST /api/payments/process` - Process Online or Cash on Service payment

### Reviews & Notifications
- `GET /api/reviews` - List reviews by service or provider
- `POST /api/reviews` - Post rating & comment for completed booking
- `GET /api/notifications` - Retrieve in-app notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Administration
- `GET /api/admin/stats` - Platform KPIs, status breakdown, category performance
- `GET /api/admin/users` - Master user list
- `PUT /api/admin/users/:id/status` - Activate or suspend user
- `PUT /api/providers/:id/status` - Approve or suspend provider profile

---

## 7. Execution Commands

```bash
# Install packages
npm install

# Start unified dev server (Express REST API + Vite frontend on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
