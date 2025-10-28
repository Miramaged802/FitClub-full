import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import { supabase } from "./lib/supabaseClient";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home.jsx"));
const Plans = lazy(() => import("./pages/Plans.jsx"));
const Gyms = lazy(() => import("./pages/Gyms.jsx"));
const Articles = lazy(() => import("./pages/Articles.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage.jsx"));
const PaymentPage = lazy(() => import("./pages/PaymentPage.jsx"));
const GymDetailPage = lazy(() => import("./pages/GymDetailPage.jsx"));
const ArticleDetailPage = lazy(() => import("./pages/ArticleDetailPage.jsx"));
const GymStaffDemo = lazy(() => import("./pages/GymStaffDemo.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.jsx"));
const AdminGyms = lazy(() => import("./pages/admin/AdminGyms.jsx"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments.jsx"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics.jsx"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.jsx"));
const AdminAuthGuard = lazy(
  () => import("./components/admin/AdminAuthGuard.jsx")
);
const Error500 = lazy(() => import("./pages/Error500.jsx"));

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen py-16 flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mb-4"></div>
      <p className="text-light-textSecondary dark:text-dark-textSecondary">
        Loading...
      </p>
    </div>
  </div>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  // Check authentication status on mount and listen for auth changes
  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsLoggedIn(false);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          {!isAdminRoute && (
            <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
          )}
          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/gyms" element={<Gyms />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/gyms/:id" element={<GymDetailPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/articles/:id" element={<ArticleDetailPage />} />
                <Route path="/gym-staff" element={<GymStaffDemo />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <AdminAuthGuard>
                      <AdminDashboard />
                    </AdminAuthGuard>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminAuthGuard>
                      <AdminUsers />
                    </AdminAuthGuard>
                  }
                />
                <Route
                  path="/admin/gyms"
                  element={
                    <AdminAuthGuard>
                      <AdminGyms />
                    </AdminAuthGuard>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <AdminAuthGuard>
                      <AdminPayments />
                    </AdminAuthGuard>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <AdminAuthGuard>
                      <AdminAnalytics />
                    </AdminAuthGuard>
                  }
                />
                <Route path="/error" element={<Error500 />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          {!isAdminRoute && <Footer />}
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--toast-bg)",
              color: "var(--toast-color)",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
