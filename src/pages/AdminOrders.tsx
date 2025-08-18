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

const AdminOrders = () => {
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
    const orderId = String(order.orderId || ''); // <- use order.orderId here
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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Order Management</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              asChild
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Link to="/admin/orders/create" className="flex items-center">
                <Plus className="h-4 w-4 mr-2" /> Create Order
              </Link>
            </Button>
            <Button variant="outline" onClick={exportToCSV} className="flex items-center">
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>
      </header>
  
      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{orders.length}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-2">Payment Status</div>
            {[
              { label: "Paid", value: paidCount, color: "text-green-600" },
              { label: "Failed", value: FailedCount, color: "text-red-600" },
              { label: "Processing", value: pendingCount, color: "text-amber-500" },
            ].map((status) => (
              <div key={status.label} className="flex justify-between text-sm">
                <span>{status.label}</span>
                <span className={`font-bold ${status.color}`}>{status.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-2">Delivery Status</div>
            {[
              { label: "Pending", value: pendingDeliveryCount, color: "text-amber-600" },
              { label: "In Transit", value: inTransitCount, color: "text-blue-500" },
              { label: "Delivered", value: deliveredCount, color: "text-green-600" },
              { label: "Not Delivered", value: notdeliveredCount, color: "text-red-600" },
            ].map((status) => (
              <div key={status.label} className="flex justify-between text-sm">
                <span>{status.label}</span>
                <span className={`font-bold ${status.color}`}>{status.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">R{totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </CardContent>
        </Card>
      </div>
       {/* Filters */}
       <div className="flex flex-col sm:flex-row items-center justify-between mt-6 mb-4 space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Customer or order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-64"
          />
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Orders Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="p-6 flex flex-col justify-between bg-white shadow-md rounded-xl hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold text-gray-900 truncate">{order.orderId || 'N/A'}</div>
                <Badge className={getDeliveryStatusBadgeClassName(order.deliveryStatus)}>
                  {order.deliveryStatus}
                </Badge>
              </div>
  
              {/* Customer Info */}
              <div className="text-sm text-gray-600 mb-3">
                <div className="truncate">{order.customerInfo?.name || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'N/A'}</div>
                <div>{order.customerInfo?.phone || order.phone || 'N/A'}</div>
              </div>
  
              {/* Items */}
              <div className="mb-3 text-sm space-y-1">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate">{item.name || item.serviceName || item.productName || 'Product'}</span>
                    <span className="font-medium">x{item.quantity || 1}</span>
                  </div>
                ))}
              </div>
  
              {/* Payment & Status */}
              <div className="flex justify-between items-center mb-2 text-sm font-medium text-gray-900">
                <div>R{(order.total || 0).toFixed(2)}</div>
                <Badge className={getPaymentMethodBadgeClassName(order.paymentMethod)}>
                  {order.paymentMethod || 'N/A'}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <Badge className={getStatusBadgeClassName(order.paymentStatus)}>
                  {order.paymentStatus}
                </Badge>
                <div className="truncate">{order.orderDate || order.createdAt || 'N/A'}</div>
              </div>
  
              {/* Actions */}
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:bg-gray-100"
                  onClick={() => navigate(`/admin/orders/edit/${order.id}`)}
                >
                  <FileText className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:bg-gray-100">
                  <Link to={`/admin/invoice/${order.id}`}>
                    <FileText className="h-4 w-4 mr-1" /> Invoice
                  </Link>
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full py-16 text-center bg-gray-50 rounded-xl shadow-md">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all" ? "No matching orders." : "No orders available."}
            </p>
          </Card>
        )}
      </div>
  
      {/* Floating Create Order Button */}
      <Button
        onClick={() => navigate("/admin/orders/create")}
        className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center z-50 sm:p-5 sm:h-14 sm:w-14"
        aria-label="Create Order"
      >
        <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    </div>
  );
  
  
};

export default AdminOrders;