import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Settings,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 leading-tight">
              Manage Your Business Smartly
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              From inventory tracking to order and customer management, everything in one beautiful dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg">
                <Link to="/admin">
                  <Settings className="h-5 w-5 mr-2" /> Admin Dashboard
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/storefront">
                  <Store className="h-5 w-5 mr-2" /> Business Profile
                </Link>
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2">
            <img src="/src/lib/image.png" alt="Dashboard preview" className="rounded-lg shadow-xl w-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Features</h2>
            <p className="text-gray-600 mt-2">Everything you need to run your business smoothly</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="flex items-center gap-2">
                <TrendingUp className="text-blue-600" />
                <CardTitle>Smart Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2">
                  <li>Total stock and order overview</li>
                  <li>Recent customers and orders</li>
                  <li>Order and payment summary</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-2">
                <Package className="text-blue-600" />
                <CardTitle>Inventory Management</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2">
                  <li>Add/edit products & categories</li>
                  <li>Low/out of stock alerts</li>
                  <li>Stock value & batch tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-2">
                <ShoppingCart className="text-blue-600" />
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2">
                  <li>Track order and delivery status</li>
                  <li>Printable invoices</li>
                  <li>Payment status updates</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-2">
                <Users className="text-blue-600" />
                <CardTitle>Customer Management</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2">
                  <li>Customer profiles and history</li>
                  <li>Purchase tracking</li>
                  <li>Contact details</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center gap-2">
                <DollarSign className="text-blue-600" />
                <CardTitle>Expense Management</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <ul className="space-y-2">
                  <li>Track daily/monthly expenses</li>
                  <li>Manage cost categories</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">What Can This System Do For You?</h2>
          <p className="text-gray-600 text-lg mb-10">
            Save time and reduce manual errors with a system built to streamline your business operations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-blue-50 p-6 rounded-lg">
              <CheckCircle className="text-blue-600 mb-4" />
              <h4 className="font-semibold mb-2">Centralized Control</h4>
              <p className="text-gray-600">Monitor inventory, sales, and customer activity from one place.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <CheckCircle className="text-blue-600 mb-4" />
              <h4 className="font-semibold mb-2">Improve Efficiency</h4>
              <p className="text-gray-600">Spend less time on admin tasks and more on growing your business.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <CheckCircle className="text-blue-600 mb-4" />
              <h4 className="font-semibold mb-2">Data-Driven Decisions</h4>
              <p className="text-gray-600">Get insights to make informed decisions about products and customers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Affordable Pricing</h2>
          <p className="text-gray-600 text-lg mb-10">
            Start managing your business today for just <span className="font-bold text-blue-600">R100/month</span>
          </p>
          <Card className="max-w-md mx-auto p-8 shadow-xl border border-gray-200">
            <h3 className="text-2xl font-semibold mb-4">Basic Plan</h3>
            <p className="text-gray-600 mb-6">Perfect for small businesses just starting out</p>
            <ul className="text-gray-600 mb-6 space-y-2 text-left">
              <li>✔ Full Dashboard Access</li>
              <li>✔ Inventory and Orders</li>
              <li>✔ Customers & Expenses</li>
              <li>✔ Monthly Updates</li>
              <li>✔ Support & Onboarding</li>
            </ul>
            <Button size="lg">Subscribe Now - R99/mo</Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Smart Business Management System. Designed with care.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
