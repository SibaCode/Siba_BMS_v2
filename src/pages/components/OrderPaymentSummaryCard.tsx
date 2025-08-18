import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/firebase"; // your Firebase config
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  FileText, 
  Download,
  ShoppingCart,
  Eye,
  Plus,
} from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Truck,  CreditCard, CheckCircle, Clock } from "lucide-react";

const OrderPaymentSummaryCard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data - in real app this would come from backend
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const openModal = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };
console.log(orders)
  const closeModal = () => {
    setSelectedOrder(null);
    setModalOpen(false);
  };
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUid(user.uid);
      } else {
        setCurrentUid(null);
        setOrders([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUid) {
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Query orders where createdBy equals current user UID
        const q = query(collection(db, "orders"), where("createdBy", "==", currentUid));
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUid]);
  
  const filteredOrders = orders.filter(order => {
    const customerName = String(order.customerInfo?.name || order.customer || '');
    const orderId = String(order.id || '');
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const paymentStatus = String(order.paymentStatus || '');
    const matchesStatus = statusFilter === "all" || paymentStatus.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });


  const getPaymentMethodBadgeClassName = (status: string) => {
    switch (status?.toLowerCase()) {
      case "cash":
        return "text-g-500 border border-amber-500 bg-transparent";
      case "transfer":
        return "text-green-500 border border-green-500 bg-transparent";
      default:
        return "text-grey-500 border border-grey-500 bg-transparent";
    }
  };

  const getDeliveryStatusBadgeClassName = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-500 text-white";
      case "in_transit":
        return "bg-red-600 text-white";
      case "pending":
        return "bg-amber-500 text-white  ";
      case "not_delivered":
        return "bg-gray-400 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };
  const getStatusBadgeClassName = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-500 text-white";
      case "failed":
        return "bg-red-600 text-white";
      case "processing":
        return "bg-amber-500 text-white  ";
      default:
        return "bg-gray-300 text-black";
    }
  };
  const paidCount = orders.filter((o) => o.paymentStatus === "paid").length;
  const FailedCount = orders.filter((o) => o.paymentStatus === "failed").length;
  const pendingCount = orders.filter((o) => o.paymentStatus === "processing").length;
  
  // Delivery status counts
  const pendingDeliveryCount = orders.filter((o) => o.deliveryStatus === "pending").length;
  const inTransitCount = orders.filter((o) => o.deliveryStatus === "in_transit").length;
  const deliveredCount = orders.filter((o) => o.deliveryStatus === "delivered").length;
  const notdeliveredCount = orders.filter((o) => o.deliveryStatus === "not_delivered").length;

  // Ensure you have orders loaded before this
const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Export CSV functionality
  const exportToCSV = () => {
    const csvHeaders = ['Order ID', 'Customer', 'Phone', 'Total', 'Payment Status', 'Delivery Status', 'Order Date'];
    const csvData = orders.map(order => [
      order.id || '',
      order.customerInfo?.name || order.customer || '',
      order.customerInfo?.phone || order.phone || '',
      order.total || 0,
      order.paymentStatus || '',
      order.deliveryStatus || '',
      order.orderDate || order.createdAt || ''
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
     
  
     <Card className="shadow-elegant">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Truck className="h-5 w-5 text-primary" />
      Order & Payment Summary
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* Order Status */}
    <div>
      <h4 className="font-medium mb-3 flex items-center gap-2">
        <ShoppingCart className="h-4 w-4" />
        Order Status
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {[
          { status: "pending", count: pendingDeliveryCount, color: "text-amber-600" },
          { status: "in_transit", count: inTransitCount, color: "text-blue-500" },
          { status: "delivered", count: deliveredCount, color: "text-green-600" },
          { status: "not_delivered", count: notdeliveredCount, color: "text-red-600" },
        ].map(item => (
          <div key={item.status} className="p-3 rounded-lg border bg-muted/40 transition hover:shadow">
            <div className="flex items-center gap-2 mb-1">
              {item.status === "delivered" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-amber-500" />
              )}
              <span className="text-sm font-medium">{item.status.replace("_", " ")}</span>
            </div>
            <div className={`text-2xl font-bold ${item.color}`}>
              {item.count}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Payment Status */}
    <div>
      <h4 className="font-medium mb-3 flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        Payment Status
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {[
          { status: "Paid", count: paidCount, color: "text-green-600" },
          { status: "Failed", count: FailedCount, color: "text-red-600" },
          { status: "Processing", count: pendingCount, color: "text-amber-500" },
        ].map(item => (
          <div key={item.status} className="p-3 rounded-lg border bg-muted/40 text-center hover:shadow">
            <div className={`text-lg font-bold ${item.color}`}>
              {item.count}
            </div>
            <div className="text-xs text-muted-foreground">{item.status}</div>
          </div>
        ))}
      </div>
    </div>

    <Button asChild variant="outline" size="sm" className="w-full mt-3 card-hover">
      <Link to="/admin/orders">View All Orders</Link>
    </Button>
  </CardContent>
</Card>

  );
  
  
};

export default OrderPaymentSummaryCard;