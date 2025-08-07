import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInventory from "./pages/AdminInventory";
import AdminOrders from "./pages/AdminOrders";
import AdminCustomers from "./pages/AdminCustomers";
import AdminInvoice from "./pages/AdminInvoice";
import AdminBusinessInfoPage from "./pages/AdminBusinessInfoPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminExpensesPage from "./pages/AdminExpensesPage";
import PublicStore from "./pages/PublicStore";
import StorefrontPage from "./pages/StorefrontPage";
import BusinessInfoPage from "./pages/BusinessInfoPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ShoppingCart from "./pages/ShoppingCart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import { AdminLayout } from "./components/AdminLayout";
import AdminCreateOrder from "./pages/AdminCreateOrder";
import AdminEditOrder from "./pages/AdminEditOrder";
import Booking from "./pages/Booking";
import Services from "./pages/Services";
import ProductFormPage from "./pages/components/ProductFormPage";
import LandingPage from "./pages/LandingPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/auth/LoginPage"; // import your login page here

import { useAuth } from "./contexts/AuthContext"; // assuming you have this
import RegisterPage from "./pages/auth/RegisterPage"; // adjust path if needed
import ProtectedRoute from "./pages/components/ProtectedRoute";


const queryClient = new QueryClient();

// ProtectedRoute component


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin routes protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout title="Dashboard Overview">
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute>
                <AdminLayout title="Inventory Management">
                  <AdminInventory />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <AdminLayout title="Order Management">
                  <AdminOrders />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute>
                <AdminLayout title="Customer Management">
                  <AdminCustomers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/invoice/:id"
            element={
              <ProtectedRoute>
                <AdminLayout title="Invoice Details">
                  <AdminInvoice />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/business-info"
            element={
              <ProtectedRoute>
                <AdminLayout title="Business Information">
                  <BusinessInfoPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/categories"
            element={
              <ProtectedRoute>
                <AdminLayout title="Category Management">
                  <AdminCategoriesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/finance/expenses"
            element={
              <ProtectedRoute>
                <AdminLayout title="Expense Management">
                  <AdminExpensesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute>
                <AdminLayout title="Bookings">
                  <Booking />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute>
                <AdminLayout title="Service Package Management">
                  <Services />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/create"
            element={
              <ProtectedRoute>
                <AdminCreateOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/edit/:id"
            element={
              <ProtectedRoute>
                <AdminEditOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory/add"
            element={
              <ProtectedRoute>
                <ProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory/edit/:id"
            element={
              <ProtectedRoute>
                <ProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/landing"
            element={
              <ProtectedRoute>
                <LandingPage />
              </ProtectedRoute>
            }
          />

          {/* Public store routes */}
          <Route path="/storefront" element={<StorefrontPage />} />
          <Route path="/store" element={<PublicStore />} />
          <Route path="/store/product/:id" element={<ProductDetailsPage />} />
          <Route path="/store/cart" element={<ShoppingCart />} />
          <Route path="/store/checkout" element={<Checkout />} />
          <Route path="/store/success" element={<OrderSuccess />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
