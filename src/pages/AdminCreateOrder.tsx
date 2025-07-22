import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Plus, 
  Minus,
  ShoppingCart,
  User,
  Package,
  CreditCard,
  Trash2
} from "lucide-react";

interface Product {
  docId: string;
  productID: string;
  name: string;
  category: string;
  productImage: string;
  variants: Variant[];
}

interface Variant {
  type: string;
  color: string;
  size: string;
  sellingPrice: number;
  stockQuantity: number;
  description: string;
  images: string[];
}

interface OrderItem {
  productId: string;
  productName: string;
  variantIndex: number;
  variant: Variant;
  quantity: number;
  price: number;
  total: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

const AdminCreateOrder = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToOrder = (product: Product, variantIndex: number, quantity: number) => {
    const variant = product.variants[variantIndex];
    const newItem: OrderItem = {
      productId: product.docId,
      productName: product.name,
      variantIndex,
      variant,
      quantity,
      price: variant.sellingPrice,
      total: variant.sellingPrice * quantity
    };

    setOrderItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === product.docId && item.variantIndex === variantIndex
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].price;
        return updated;
      } else {
        return [...prev, newItem];
      }
    });

    toast({
      title: "Added to order",
      description: `${product.name} (${variant.color}, ${variant.size}) added to order`
    });
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromOrder(index);
      return;
    }

    setOrderItems(prev => {
      const updated = [...prev];
      updated[index].quantity = newQuantity;
      updated[index].total = updated[index].quantity * updated[index].price;
      return updated;
    });
  };

  const removeFromOrder = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!customerInfo.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer email is required",
        variant: "destructive"
      });
      return false;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item to the order",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const submitOrder = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const orderData = {
        customerInfo,
        orderItems: orderItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          variant: item.variant,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        paymentMethod,
        paymentStatus: "pending",
        deliveryStatus: "processing",
        notes,
        createdAt: new Date(),
        orderSource: "admin"
      };

      await addDoc(collection(db, "orders"), orderData);
      
      toast({
        title: "Order Created",
        description: "Order has been successfully created",
      });

      navigate("/admin/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-2 self-start"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Orders</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold">Create New Order</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4 sm:space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm">Full Name</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter customer name"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-sm">Phone</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm">City</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Enter city"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm">Address</Label>
                  <Textarea
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter full address"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="postalCode" className="text-sm">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={customerInfo.postalCode}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="Enter postal code"
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                  Select Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 sm:space-y-6">
                  {products.map((product) => (
                    <motion.div
                      key={product.docId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-3 sm:p-4 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <img
                          src={product.productImage}
                          alt={product.name}
                          className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base">{product.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{product.category}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {product.variants.length} variants
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Available Variants:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {product.variants.map((variant, variantIndex) => (
                            <div
                              key={variantIndex}
                              className="border rounded p-3 space-y-2"
                            >
                              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-medium text-xs sm:text-sm">{variant.color} • {variant.size}</p>
                                  <p className="text-xs text-muted-foreground truncate">{variant.description}</p>
                                  <p className="text-sm font-bold">${variant.sellingPrice}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">Stock: {variant.stockQuantity}</span>
                                  <Button
                                    size="sm"
                                    onClick={() => addToOrder(product, variantIndex, 1)}
                                    disabled={variant.stockQuantity === 0}
                                    className="text-xs px-2 h-7"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment & Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                  Payment & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paymentMethod" className="text-sm">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions or notes"
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm">
                    No items added to order yet
                  </p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base truncate">{item.productName}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {item.variant.color} • {item.variant.size}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs sm:text-sm min-w-[2rem] text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="font-medium text-sm sm:text-base">${item.total.toFixed(2)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromOrder(index)}
                            className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {orderItems.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (10%):</span>
                        <span>${calculateTax().toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-base">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={submitOrder}
                      disabled={submitting}
                      className="w-full mt-4 text-sm"
                    >
                      {submitting ? "Creating Order..." : "Create Order"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateOrder;