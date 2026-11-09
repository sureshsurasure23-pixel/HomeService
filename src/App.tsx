import React, { useState } from 'react';
import { BookingModal } from './components/BookingModal.tsx';
import { Footer } from './components/Footer.tsx';
import { Navbar } from './components/Navbar.tsx';
import { PaymentModal } from './components/PaymentModal.tsx';
import { ReviewModal } from './components/ReviewModal.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { NotificationProvider, useNotifications } from './context/NotificationContext.tsx';

// Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { CustomerDashboard } from './pages/customer/CustomerDashboard.tsx';
import { EditProfilePage } from './pages/customer/EditProfilePage.tsx';
import { MyBookingsPage } from './pages/customer/MyBookingsPage.tsx';
import { BookingRequestsPage } from './pages/provider/BookingRequestsPage.tsx';
import { ManageServicesPage } from './pages/provider/ManageServicesPage.tsx';
import { ProviderDashboard } from './pages/provider/ProviderDashboard.tsx';
import { AboutPage } from './pages/public/AboutPage.tsx';
import { ContactPage } from './pages/public/ContactPage.tsx';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage.tsx';
import { HomePage } from './pages/public/HomePage.tsx';
import { LoginPage } from './pages/public/LoginPage.tsx';
import { ProviderDetailPage } from './pages/public/ProviderDetailPage.tsx';
import { RegisterPage } from './pages/public/RegisterPage.tsx';
import { ServiceDetailPage } from './pages/public/ServiceDetailPage.tsx';
import { ServicesPage } from './pages/public/ServicesPage.tsx';

import { Booking, Service } from './types.ts';

function MainApp() {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});

  // Global Modals State
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const handleNavigate = (view: string, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (service: Service) => {
    if (!user) {
      showToast('info', 'Please sign in as a customer to book this service.');
      handleNavigate('login');
      return;
    }
    setBookingService(service);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} onBookService={handleOpenBooking} />;
      case 'services':
        return (
          <ServicesPage
            initialCategoryId={viewParams.category}
            initialSearch={viewParams.search}
            onNavigate={handleNavigate}
            onBookService={handleOpenBooking}
          />
        );
      case 'service-detail':
        return (
          <ServiceDetailPage
            serviceId={viewParams.id}
            onNavigate={handleNavigate}
            onBookService={handleOpenBooking}
          />
        );
      case 'provider-detail':
        return (
          <ProviderDetailPage
            providerId={viewParams.id}
            onNavigate={handleNavigate}
            onBookService={handleOpenBooking}
          />
        );
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      // Customer
      case 'customer-dashboard':
        return (
          <CustomerDashboard
            onNavigate={handleNavigate}
            onOpenPayment={(b) => setPaymentBooking(b)}
            onOpenReview={(b) => setReviewBooking(b)}
          />
        );
      case 'customer-bookings':
      case 'bookings':
        return (
          <MyBookingsPage
            onNavigate={handleNavigate}
            onOpenPayment={(b) => setPaymentBooking(b)}
            onOpenReview={(b) => setReviewBooking(b)}
          />
        );
      case 'profile':
        return <EditProfilePage />;
      // Provider
      case 'provider-dashboard':
        return <ProviderDashboard onNavigate={handleNavigate} />;
      case 'provider-requests':
        return <BookingRequestsPage />;
      case 'provider-services':
        return <ManageServicesPage />;
      // Admin
      case 'admin-dashboard':
        return <AdminDashboard />;
      default:
        return <HomePage onNavigate={handleNavigate} onBookService={handleOpenBooking} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />
      <main className="flex-1">{renderCurrentView()}</main>
      <Footer onNavigate={handleNavigate} />

      {/* Global Booking Modal */}
      {bookingService && (
        <BookingModal
          service={bookingService}
          isOpen={!!bookingService}
          onClose={() => setBookingService(null)}
          onSuccess={(bookingId) => {
            handleNavigate('customer-bookings');
          }}
        />
      )}

      {/* Global Payment Modal */}
      {paymentBooking && (
        <PaymentModal
          booking={paymentBooking}
          isOpen={!!paymentBooking}
          onClose={() => setPaymentBooking(null)}
          onSuccess={() => {
            // refresh view
            handleNavigate(currentView);
          }}
        />
      )}

      {/* Global Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          isOpen={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            handleNavigate(currentView);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
