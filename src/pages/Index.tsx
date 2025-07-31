import {
  ShoppingBag,
  BarChart2,
  Users,
  Package,
  Store,
  Settings,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-600 via-blue-400 to-white  font-sans">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center max-w-7xl mx-auto px-6 py-20 md:py-32 gap-10">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight drop-shadow-md">
            Take Control of Your Business
            <br />
            Anywhere, Anytime
          </h1>
          <p className="mb-8 text-lg sm:text-xl drop-shadow-sm max-w-md mx-auto md:mx-0">
            Manage your inventory, sales, and customers with ease.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <Button
              asChild
              size="lg"
              className="bg-blue-700 text-white font-bold shadow-lg hover:bg-blue-800 "
            >
              <a href="/contact">Get Started</a>
            </Button>
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

        <div className="md:w-1/2 max-w-md mx-auto">
          <img
            src="https://i.ibb.co/rGv5R48Z/Screenshot-from-2025-07-30-18-19-34.png"
            alt="Business app preview"
            className="rounded-3xl shadow-2xl w-full"
            loading="lazy"
          />
        </div>
      </section>

     {/* Features Section */}
<section className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-6">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-gray-900">Powerful Features</h2>
      <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
        Save time, reduce errors, and grow your business with tools built to make running your operations effortless.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {[
        {
          icon: <TrendingUp className="h-6 w-6" />,
          title: "Smart Dashboard",
          features: [
            "Total stock & order overview",
            "Recent customers & orders",
            "Order & payment summary",
          ],
        },
        {
          icon: <Package className="h-6 w-6" />,
          title: "Inventory Management",
          features: [
            "Add/edit products & categories",
            "Low/out of stock alerts",
            "Real-time stock value",
          ],
        },
        {
          icon: <ShoppingCart className="h-6 w-6" />,
          title: "Order Management",
          features: [
            "Track order & delivery status",
            "Printable invoices",
            "Payment status updates",
          ],
        },
        {
          icon: <Users className="h-6 w-6" />,
          title: "Customer Management",
          features: [
            "Customer profiles & history",
            "Purchase tracking",
            "Contact details",
          ],
        },
        {
          icon: <DollarSign className="h-6 w-6" />,
          title: "Expense Management",
          features: [
            "Daily/monthly expense tracking",
            "Manage cost categories",
            "Detailed expense breakdowns",
          ],
        },
      ].map((item, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 flex flex-col items-start space-y-4"
        >
          <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
            {item.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
          <ul className="text-gray-600 list-disc list-inside space-y-1 pl-2">
            {item.features.map((feat, i) => (
              <li key={i}>{feat}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Pricing Section */}
   {/* Pricing Section */}
<section className="bg-blue-50 py-20 px-6">
  <div className="max-w-4xl mx-auto text-center mb-12">
    <h2 className="text-4xl font-bold text-blue-900 mb-4">Simple Pricing</h2>
    <p className="text-blue-700 text-lg">
      One plan. Everything you need to manage your business.
    </p>
  </div>

  <div className="max-w-md mx-auto">
    <div className="bg-white border border-blue-700 rounded-2xl shadow-lg p-8 flex flex-col justify-between hover:shadow-xl transition">
      <div>
        <h3 className="text-2xl font-semibold text-blue-900 mb-2">Business Plan</h3>
        <p className="text-4xl font-extrabold text-blue-700 mb-6">R99/month</p>
        <ul className="text-left text-blue-800 list-disc list-inside space-y-3">
          <li>Dashboard with real-time insights</li>
          <li>Manage up to 100 products</li>
          <li>Track orders and payments</li>
          <li>Low stock and out-of-stock alerts</li>
          <li>Customer & expense management</li>
          <li>Printable invoices</li>
        </ul>
      </div>

      <Button
        size="lg"
        className="mt-8 w-full bg-blue-700 text-white hover:bg-blue-800 font-semibold transition"
      >
        Get Started
      </Button>
    </div>
  </div>
</section>



{/* Footer */}
<footer className="bg-gray-100 text-gray-500 text-center text-sm py-6 mt-32 border-t border-gray-200">
  © 2025 Your Business Name. All rights reserved.{' '}
  <a href="/admin" className="text-blue-600 hover:underline">
    Go to Dashboard
  </a>
</footer>


    </div>
  );
};

export default Index;
