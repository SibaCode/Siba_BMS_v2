import { Button } from "@/components/ui/button";
import { ShoppingBag, BarChart2, Users, Package } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-600 via-blue-400 to-white text-indigo-900 font-sans">
      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center max-w-7xl mx-auto px-6 py-20 md:py-32 gap-10">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight drop-shadow-md">
            Take Control of Your Business<br />Anywhere, Anytime
          </h1>
          <p className="mb-8 text-lg sm:text-xl drop-shadow-sm max-w-md mx-auto md:mx-0">
            Manage your inventory, sales, and customers all from your phone with ease.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <Button
              asChild
              size="lg"
              className="bg-blue-700 text-white font-bold shadow-lg hover:bg-blue-800 transition"
            >
              <a href="/admin">Go to Dashboard</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-blue-700 text-blue-700 hover:bg-blue-100 transition"
            >
              <a href="/storefront">View Storefront</a>
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 max-w-md mx-auto">
          <img
            src="/src/lib/image.png"
            alt="Business app preview"
            className="rounded-3xl shadow-2xl w-full"
            loading="lazy"
          />
        </div>
      </section>

      {/* Features */}
      <section className="bg-white text-indigo-900 py-16 px-6">
        <div className="max-w-5xl mx-auto grid gap-12 sm:grid-cols-2 md:grid-cols-4">
          {[
            {
              icon: <ShoppingBag className="h-10 w-10 text-blue-600" />,
              title: "Manage Orders",
              description: "Track sales & shipments with one tap.",
            },
            {
              icon: <Package className="h-10 w-10 text-blue-600" />,
              title: "Inventory Control",
              description: "Add, update, and get alerts on stock levels.",
            },
            {
              icon: <Users className="h-10 w-10 text-blue-600" />,
              title: "Customer Insights",
              description: "Know your customers better for targeted marketing.",
            },
            {
              icon: <BarChart2 className="h-10 w-10 text-blue-600" />,
              title: "Sales Analytics",
              description: "Get visual reports and optimize your business.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="p-4 rounded-full bg-blue-100">{feature.icon}</div>
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-gray-700 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-blue-50 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-extrabold text-blue-900 mb-4">
            Simple Pricing Plans
          </h2>
          <p className="text-blue-700 max-w-xl mx-auto">
            Choose the plan that suits your business needs. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid gap-8 sm:grid-cols-1 md:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "$9/mo",
              features: [
                "Manage up to 100 products",
                "Basic sales reports",
                "Email support",
              ],
            },
            {
              name: "Professional",
              price: "$29/mo",
              features: [
                "Unlimited products",
                "Advanced analytics",
                "Priority support",
                "Mobile app access",
              ],
              popular: true,
            },
            {
              name: "Enterprise",
              price: "Contact Us",
              features: [
                "Custom integrations",
                "Dedicated account manager",
                "24/7 support",
                "Onboarding assistance",
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-8 shadow-lg border ${
                plan.popular ? "border-blue-700 bg-white" : "border-transparent bg-white/90"
              } flex flex-col justify-between`}
            >
              <div>
                <h3 className="text-xl font-bold mb-2 text-blue-900">{plan.name}</h3>
                <p className="text-3xl font-extrabold mb-6 text-blue-700">{plan.price}</p>
                <ul className="mb-8 text-left text-blue-800 list-disc list-inside space-y-2">
                  {plan.features.map((feat) => (
                    <li key={feat}>{feat}</li>
                  ))}
                </ul>
              </div>
              <Button
                size="lg"
                className={`w-full font-semibold ${
                  plan.popular
                    ? "bg-blue-700 text-white hover:bg-blue-800"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                } transition`}
              >
                {plan.popular ? "Get Started" : "Learn More"}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-700 shadow-lg p-4 flex justify-center md:hidden z-50">
        <Button
          asChild
          size="lg"
          className="w-full max-w-md bg-white text-blue-700 font-bold"
        >
          <a href="/admin">Open Dashboard</a>
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-blue-800 text-blue-200 text-center text-sm py-6 mt-20">
        © 2025 Your Business Name. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
