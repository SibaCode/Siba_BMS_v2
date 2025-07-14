import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Package, 
  Store, 
  Download,
  Mail,
  ArrowRight
} from "lucide-react";

const OrderSuccess = () => {
  // Mock order data - in real app this would come from URL params or state
  const order = {
    id: "ORD-001",
    items: [
      { name: "Premium Apron", quantity: 2, price: 45.99 },
      { name: "Coffee Mug Set", quantity: 1, price: 29.99 }
    ],
    subtotal: 121.97,
    tax: 18.30,
    total: 140.27,
    customer: {
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "078-123-4567"
    },
    paymentMethod: "Yoco",
    estimatedDelivery: "2024-01-20"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Store className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Order Confirmation</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-success mb-2">Order Placed Successfully!</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Thank you for your order. Your order #{order.id} has been confirmed.
              </p>
              <div className="flex justify-center space-x-4 mb-6">
                <Badge variant="secondary" className="px-4 py-2">
                  <Mail className="h-4 w-4 mr-2" />
                  Confirmation email sent to {order.customer.email}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link to="/store">
                    <Store className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/admin/orders">
                    <Package className="h-4 w-4 mr-2" />
                    Track Order
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Order Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-medium">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Delivery:</span>
                  <span className="font-medium">{order.estimatedDelivery}</span>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Items Ordered:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-muted-foreground text-sm ml-2">
                            x{item.quantity}
                          </span>
                        </div>
                        <span className="font-semibold">
                          R{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (15%):</span>
                    <span>R{order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>R{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <div className="font-medium">{order.customer.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <div className="font-medium">{order.customer.email}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <div className="font-medium">{order.customer.phone}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Order Confirmation</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email confirmation with your order details.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Order Processing</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team will prepare your order for shipment.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Shipping & Delivery</h4>
                  <p className="text-sm text-muted-foreground">
                    Your order will be shipped and delivered by {order.estimatedDelivery}.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button asChild size="lg">
              <Link to="/store">
                <Store className="h-4 w-4 mr-2" />
                Continue Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;