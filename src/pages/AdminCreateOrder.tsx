import React,{ useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { motion } from "framer-motion";
import { updateDoc, doc ,getDoc,arrayUnion, arrayRemove } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  User,
  Package,
  Trash2,
} from "lucide-react";
// import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getAuth, onAuthStateChanged  } from "firebase/auth";
import { query, where } from "firebase/firestore";

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
interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string; // optional
}

interface ServiceOrderItem {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
  total: number;

}

type Service = {
  id: string;
  name: string;
  price: number;
  duration?: string;
};

type OrderItem =
  | {
      type: "product";
      productId: string;
      productName: string;
      variantIndex: number;
      variant: Variant;
      price: number;
      quantity: number;
      total: number;
    }
  | {
      type: "service";
      serviceId: string;
      serviceName: string;
      price: number;
      quantity: number;
      total: number;
      duration?: string;
    };

    function processItem(item: OrderItem) {
      if (item.type === "product") {
        // TypeScript knows item is product variant here
        console.log(item.productId);
      } else {
        // item is service variant
        console.log(item.serviceId);
      }
    }

interface CustomerInfo {
  id?:string;
  name: string;
  email: string;
  phone: string;
  location: string;
  notes: string;
  preferredContactMethod:string;
  referredBy:string;
  status: string;            
  joinDate: string;  
  totalOrders:number;
  totalSpent: number;

}

const emptyCustomer: CustomerInfo = {
  id: undefined,
  name: "",
  email: "",
  phone: "",
  location: "",
  notes: "",
  preferredContactMethod: "",
  referredBy: "",
  status: "active",
  joinDate: new Date().toISOString().split("T")[0],
  totalOrders: 0,
  totalSpent: 0,
};
const AdminCreateOrder = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(emptyCustomer);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("collect");
  const [courierDetails, setCourierDetails] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [allCustomers, setAllCustomers] = useState<(CustomerInfo & {id: string})[]>([]); 
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceOrderItem[]>([]);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);

//   useEffect(() => {
//     fetchProducts();
//     fetchCustomers();
// fetchServicePackages();
//   }, []);

  const fetchServicePackages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "servicePackages"));
      const packages: ServicePackage[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ServicePackage[];
      setServicePackages(packages);
    } catch (error) {
      console.error("Error fetching service packages:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map((doc) => ({
        docId: doc.id,
        ...(doc.data() as Omit<Product, "docId">),
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchCustomers = async () => {
    if (!currentUserUid) return;  // Wait until you have the user
  
    try {
      const customersRef = collection(db, "customers");
      const q = query(customersRef, where("uid", "==", currentUserUid));
      const querySnapshot = await getDocs(q);
  
      const customersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as CustomerInfo),
      }));
      setAllCustomers(customersData);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    }
  };
  
  const handleCustomerSelect = (customer: CustomerInfo) => {
    setCustomerInfo({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      location: customer.location || "",
      notes: customer.notes || "",
      preferredContactMethod: customer.preferredContactMethod || "",
      referredBy: customer.referredBy || "",
      status: customer.status || "active",
      joinDate: customer.joinDate || new Date().toISOString().split("T")[0],
      totalOrders: customer.totalOrders ?? 0,
      totalSpent: customer.totalSpent ?? 0,
    });
    setShowCustomerList(false);
  };

 // Auth listener
 useEffect(() => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setCurrentUserUid(user.uid);
    } else {
      setCurrentUserUid(null);
    }
  });
  return unsubscribe;
}, []);

useEffect(() => {
  fetchProducts();
  fetchServicePackages();

  if (currentUserUid) {
    fetchCustomers();
  }
}, [currentUserUid]);


  const addProductToOrder = (product: Product, variantIndex: number) => {
    const variant = product.variants[variantIndex];
    const existingIndex = orderItems.findIndex(
      (item) =>
        item.type === "product" &&
        item.productId === product.docId &&
        item.variantIndex === variantIndex
    );
  
    if (existingIndex >= 0) {
      updateQuantity(existingIndex, orderItems[existingIndex].quantity + 1);
    } else {
      const newItem: OrderItem = {
        type: "product",
        productId: product.docId,
        productName: product.name,
        variantIndex,
        variant,
        price: variant.sellingPrice,
        quantity: 1,
        total: variant.sellingPrice,
      };
      setOrderItems([...orderItems, newItem]);
    }
  };
  useEffect(() => {
    fetchProducts();
    fetchServicePackages();
  
    if (currentUserUid) {
      fetchCustomers();
    }
  }, [currentUserUid]);
  function addServiceToOrder(service: Service) {
    const newServiceItem: OrderItem = {
      type: "service",
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      quantity: 1,
      total: service.price * 1,
      duration: service.duration, // optional
    };
  
    setOrderItems(prevItems => [...prevItems, newServiceItem]);
  }
  
  
  
  
const updateServiceQuantity = (index: number, newQty: number) => {
  if (newQty < 1) return;
  const updated = [...serviceItems];
  const item = updated[index];
  updated[index] = {
    ...item,
    quantity: newQty,
    total: item.price * newQty,
  };
  setServiceItems(updated);
};

const removeService = (index: number) => {
  setServiceItems(serviceItems.filter((_, i) => i !== index));
};

  const removeItem = (itemIndex: number) => {
    setOrderItems(orderItems.filter((_, index) => index !== itemIndex));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.15; // 15% VAT
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };
  const filteredCustomers = allCustomers.filter((c) =>
    c.name.toLowerCase().includes(customerInfo.name.toLowerCase())
  );
  console.log("Filtered customers:", filteredCustomers);

  const validateForm = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "Validation Error",
        description: "Customer name and phone are required",
        variant: "destructive",
      });
      return false;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one product to the order",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const decreaseStock = async (productId: string, variantIndex: number, quantity: number) => {
    // Fetch product document, update stockQuantity for the variant
    // You will need to update the product doc's variants array immutably
    // Example:
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) return;
  
    const productData = productSnap.data() as Product;
    const variants = [...productData.variants];
    const variant = variants[variantIndex];
    if (variant.stockQuantity < quantity) {
      toast({
        title: "Stock error",
        description: `Not enough stock to decrease for ${productData.name} variant ${variant.color}, ${variant.size}`,
        variant: "destructive",
      });
      return;
    }
  
    variants[variantIndex] = {
      ...variant,
      stockQuantity: variant.stockQuantity - quantity,
    };
  
    await updateDoc(productRef, { variants });
  };
  
  const createOrder = async () => {
    if (!validateForm()) return;
  
    for (const item of orderItems) {
      if (item.type === "product" && item.quantity > item.variant.stockQuantity) {
        toast({
          title: "Stock error",
          description: `Insufficient stock for ${item.productName} (${item.variant.color}, ${item.variant.size})`,
          variant: "destructive",
        });
        return;
      }
    }
  
    setSubmitting(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
  
      let customerId = customerInfo.id;
  
      if (!customerId) {
        const { id, ...customerInfoToSave } = customerInfo;
        const customerDocRef = await addDoc(collection(db, "customers"), customerInfoToSave);
        customerId = customerDocRef.id;
      }
  
      const orderData = {
        customerId,
        customerInfo: { ...customerInfo, id: customerId },
        items: orderItems,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        paymentMethod,
        orderId: `ORD-${Date.now()}`,
        paymentStatus: "processing",
        deliveryStatus: "pending",
        notes,
        orderDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser ? currentUser.uid : "admin",

      };
  
      const orderDocRef = await addDoc(collection(db, "orders"), orderData);
  
      // decrease stock only for products
      for (const item of orderItems) {
        if (item.type === "product") {
          // Your existing decrease stock logic here
          await decreaseStock(item.productId, item.variantIndex, item.quantity);
        }
      }
  
      toast({
        title: "Success",
        description: "Order created successfully",
      });
  
      navigate("/admin/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  
  
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
  
    const item = orderItems[index];
  
    if (item.type === "product" && newQuantity > item.variant.stockQuantity) {
      toast({
        title: "Stock limit reached",
        description: `Only ${item.variant.stockQuantity} units available for ${item.productName} (${item.variant.color}, ${item.variant.size})`,
        variant: "destructive",
      });
      return;
    }
  
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...item,
      quantity: newQuantity,
      total: item.price * newQuantity,
    };
    setOrderItems(updatedItems);
  };
  
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100/50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/orders">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <ShoppingCart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Create New Order</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Customer Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 
                    {/* Select customer dropdown */}
                    <div className="mb-4">
                      <Label htmlFor="selectCustomer">Customer</Label>
                      <select
                        id="selectCustomer"
                        className="mt-1 w-full border rounded px-3 py-2"
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          if (selectedId === "new") {
                            setCustomerInfo(emptyCustomer); // New customer selected
                          } else {
                            const selected = allCustomers.find((c) => c.id === selectedId);
                            if (selected) setCustomerInfo(selected); // Existing customer
                          }
                        }}
                        value={customerInfo.id ?? "new"}
                      >
                        <option value="new">➕ New Customer</option>
                        {allCustomers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.phone})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Inputs to fill out customer details */}
                    <div className="mb-4">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        placeholder="John Doe"
                        className="mt-1 w-full border rounded px-3 py-2"
                      />
                    </div>
                      {/* Customer Full Name */}
   
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, phone: e.target.value })
                        }
                        placeholder="+27 123 456 7890"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, email: e.target.value })
                        }
                        placeholder="customer@email.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">location</Label>
                      <Input
                        id="location"
                        value={customerInfo.location}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, location: e.target.value })
                        }
                        placeholder="Cape Town"
                        className="mt-1"
                      />
                    </div>
                   
                   
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Product List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Add Items to Order</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4">
                  <Tabs defaultValue="products" className="w-full">
                    
                    <TabsList className="mb-4">
                      <TabsTrigger value="products">Products</TabsTrigger>
                      <TabsTrigger value="services">Services</TabsTrigger>
                    </TabsList>

                    {/* 🔶 Products Tab */}
                              <TabsContent value="products">
                                {loading ? (
                                  <p>Loading products...</p>
                                ) : products.length === 0 ? (
                                  <p>No products found.</p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[500px] overflow-hidden">
                                    {/* Search + Product List */}
                                    <div className="col-span-1 border-r pr-2 overflow-y-auto">
                                      <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="w-full mb-2 px-3 py-2 border rounded"
                                        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                                      />
                                      <ul className="space-y-2">
                                        {products
                                          .filter((p) => p.name.toLowerCase().includes(searchTerm || ""))
                                          .map((product) => (
                                            <li
                                              key={product.docId}
                                              className={`p-2 rounded cursor-pointer hover:bg-orange-100 transition ${
                                                selectedProduct?.docId === product.docId ? "bg-orange-200" : ""
                                              }`}
                                              onClick={() => setSelectedProduct(product)}
                                            >
                                              <div className="flex items-center space-x-2">
                                                <img
                                                  src={product.productImage}
                                                  alt={product.name}
                                                  className="w-10 h-10 object-cover rounded"
                                                />
                                                <span className="text-sm">{product.name}</span>
                                              </div>
                                            </li>
                                          ))}
                                      </ul>
                                    </div>

                                    {/* Variant View */}
                                    <div className="col-span-2 overflow-y-auto px-2">
                                      {selectedProduct ? (
                                        <>
                                          <h3 className="text-lg font-semibold mb-2">{selectedProduct.name}</h3>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {selectedProduct.variants.map((variant, index) => {
                                              const isOutOfStock = variant.stockQuantity === 0;
                                              return (
                                                <div
                                                  key={`${selectedProduct.docId}-${index}`}
                                                  className={`p-4 border rounded-lg bg-white shadow-sm transition ${
                                                    isOutOfStock ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
                                                  }`}
                                                  onClick={() =>
                                                    !isOutOfStock && addProductToOrder(selectedProduct, index)
                                                  }
                                                >
                                                  <div className="flex items-center space-x-4">
                                                    <img
                                                      src={variant.images[0] || selectedProduct.productImage}
                                                      alt={variant.type}
                                                      className="w-16 h-16 object-cover rounded"
                                                    />
                                                    <div className="flex flex-col">
                                                      <p className="font-medium text-sm">{variant.type}</p>
                                                      <p className="text-xs text-gray-500">
                                                        Color: {variant.color} | Size: {variant.size}
                                                      </p>
                                                      <p className="font-bold text-orange-600 text-md">
                                                        R{variant.sellingPrice.toFixed(2)}
                                                      </p>
                                                      <Badge
                                                        variant={isOutOfStock ? "destructive" : "default"}
                                                        className="w-max text-xs mt-1"
                                                      >
                                                        {isOutOfStock ? "Out of Stock" : `${variant.stockQuantity} in stock`}
                                                      </Badge>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </>
                                      ) : (
                                        <p className="text-gray-500">Select a product to view variants.</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </TabsContent>

                  {/* 🧰 Services Tab */}
                  {/* 🧰 Services Tab */}
                  <TabsContent value="services">
  {loading ? (
    <p>Loading services...</p>
  ) : servicePackages.length === 0 ? (
    <p>No services available.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {servicePackages.map((service) => (
        <div
          key={service.id}
          className="border p-4 rounded-lg bg-white shadow hover:shadow-md transition cursor-pointer"
          onClick={() => addServiceToOrder(service)}
        >
          <div className="font-semibold text-sm mb-1">{service.name}</div>
          <p className="text-xs text-gray-500 mb-1">{service.description}</p>
          <p className="text-orange-600 font-bold text-md">R{service.price.toFixed(2)}</p>
        </div>
      ))}
    </div>
  )}
</TabsContent>


      </Tabs>
    </CardContent>
  </Card>
</motion.div>

          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="sticky top-8 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {orderItems.length === 0 ? (
                  <p>Your order is empty.</p>
                ) : (
                  <>
                    {orderItems.map((item, index) => (
  <div
    key={index}
    className="border rounded p-3 bg-gray-50 flex justify-between items-center"
  >
    <div>
      {/* Render productName or serviceName based on type */}
      <div className="font-semibold">
        {item.type === "product" ? item.productName : item.serviceName}
      </div>

      {/* Render variant info only if product */}
      {item.type === "product" && item.variant && (
        <div className="text-xs text-muted-foreground">
          Type: {item.variant.type}, Color: {item.variant.color}, Size: {item.variant.size}
        </div>
      )}

      {/* Price and Quantity (both types have these) */}
      <div className="text-xs text-muted-foreground">
        Price: R{item.price.toFixed(2)} x Quantity: {item.quantity}
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => updateQuantity(index, item.quantity - 1)}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span>{item.quantity}</span>
      <Button
        size="sm"
        variant="outline"
        onClick={() => updateQuantity(index, item.quantity + 1)}
      >
        <Plus className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-red-500"
        onClick={() => removeItem(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </div>
))}


                    <div className="border-t pt-4 space-y-2 text-right">
                      <div>
                        Total: <span className="font-semibold">R{calculateTotal().toFixed(2)}</span>
                      </div>
                     
                    </div>

                    <div className="mt-6 space-y-4">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <select
                        id="paymentMethod"
                        className="w-full border rounded px-3 py-2"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="cash">Cash</option>
                        <option value="transfer">Bank Transfer</option>
                      </select>

                      <Label htmlFor="notes">Order Notes</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any special instructions or notes"
                        rows={3}
                      />

                      <Button
                        className="w-full"
                        onClick={createOrder}
                        disabled={submitting}
                      >
                        {submitting ? "Creating Order..." : "Create Order"}
                      </Button>
                    </div>
                    <div className="space-y-6">
      {/* Delivery Method */}
      <div>
        <Label>Delivery Method</Label>
        <div className="flex space-x-4 mt-1">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="deliveryMethod"
              value="collect"
              checked={deliveryMethod === "collect"}
              onChange={() => setDeliveryMethod("collect")}
              className="mr-2"
            />
            Collect
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="deliveryMethod"
              value="courier"
              checked={deliveryMethod === "courier"}
              onChange={() => setDeliveryMethod("courier")}
              className="mr-2"
            />
            Courier
          </label>
        </div>
      </div>

      {/* Courier Details only if courier */}
      {deliveryMethod === "courier" && (
        <div>
          <Label htmlFor="courierDetails">Courier Details</Label>
          <Textarea
            id="courierDetails"
            value={courierDetails}
            onChange={(e) => setCourierDetails(e.target.value)}
            placeholder="Enter courier info"
            className="mt-1"
          />
        </div>
      )}

    

      {/* Other inputs like phone, address etc can go here */}
    </div>
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
// Cannot find name 'handleCustomerSelect'.ts(2304)
