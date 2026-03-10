import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { useAuthStore } from "./stores/useAuthStore";
import { Toaster } from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import PrayerTimesPage from "./pages/PrayerTimesPage";

// User Pages
import UserBooksList from "./pages/UserBooksList";
import BookDetails from "./pages/BookDetails";
import MyBorrowings from "./pages/MyBorrowings";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooksList from "./pages/admin/BooksList";
import BookForm from "./components/admin/BookForm";
import BorrowRequests from "./pages/admin/BorrowRequests";
import UserHistory from "./pages/admin/UserHistory";
import AdminRoute from "./components/AdminRoute";
import AdminEvents from "./pages/admin/AdminEvents";
import EventForm from "./components/admin/EventForm";
import EventsPage from "./pages/EventsPage";
import PrayerSettings from "./pages/admin/PrayerSettings";
import AboutPage from "./pages/AboutPage";
import DeveloperInfo from "./pages/DeveloperInfo";
import BorrowersList from "./pages/admin/BorrowersList";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="size-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  console.log("auth:", authUser);

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />

      <Routes>
        {/* Public Routes - Accessible to everyone */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!authUser ? <RegisterPage /> : <Navigate to="/" />}
        />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/prayer-times" element={<PrayerTimesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/developers" element={<DeveloperInfo />} />
        {/* Protected Routes - Require Authentication (Any logged-in user) */}
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        {/* User Book Routes */}
        <Route
          path="/books"
          element={authUser ? <UserBooksList /> : <Navigate to="/login" />}
        />
        <Route
          path="/books/:id"
          element={authUser ? <BookDetails /> : <Navigate to="/login" />}
        />
        <Route
          path="/my-borrowings"
          element={authUser ? <MyBorrowings /> : <Navigate to="/login" />}
        />
        {/* Admin Routes - Require Admin Role */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/books"
          element={
            <AdminRoute>
              <AdminBooksList />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/books/new"
          element={
            <AdminRoute>
              <BookForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/books/edit/:id"
          element={
            <AdminRoute>
              <BookForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/borrow-requests"
          element={
            <AdminRoute>
              <BorrowRequests />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/user-history/:userId"
          element={
            <AdminRoute>
              <UserHistory />
            </AdminRoute>
          }
        />
        {/* Add routes */}
        <Route path="/events" element={<EventsPage />} />
        {/* Admin Event Routes */}
        <Route
          path="/admin/events"
          element={
            <AdminRoute>
              <AdminEvents />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/events/new"
          element={
            <AdminRoute>
              <EventForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/events/edit/:id"
          element={
            <AdminRoute>
              <EventForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/borrowers"
          element={
            <AdminRoute>
              <BorrowersList />
            </AdminRoute>
          }
        />

        {/* prayer settings */}
        <Route
          path="/admin/prayer-settings"
          element={
            <AdminRoute>
              <PrayerSettings />
            </AdminRoute>
          }
        />

        {/* Catch all route - 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
