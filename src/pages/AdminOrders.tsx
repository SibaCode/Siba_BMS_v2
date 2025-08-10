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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <ShoppingCart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                <Link to="/admin/orders/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Link>
              </Button>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

     
  <Card>
    <CardContent className="p-4">
      <div className="text-2xl font-bold">{orders.length}</div>
      <div className="text-sm text-muted-foreground">Total Orders</div>
    </CardContent>
  </Card>

  <Card>
  <CardContent className="p-4">
    <div className="text-sm font-semibold text-muted-foreground mb-2">Payment Status</div>
    <div className="space-y-1 text-sm">
      <div className="flex items-center space-x-2">
        <span>Paid</span>
        <span className="font-bold text-green-600">{paidCount}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>Failed</span>
        <span className="font-bold text-red-600">{FailedCount}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>Processing</span>
        <span className="font-bold text-amber-500">{pendingCount}</span>
      </div>
    </div>
  </CardContent>
</Card>

<Card>
  <CardContent className="p-4">
    <div className="text-sm font-semibold text-muted-foreground mb-2">Delivery Status</div>
    <div className="space-y-1 text-sm">
      <div className="flex items-center space-x-2">
        <span>Pending</span>
        <span className="font-bold text-amber-600">{pendingDeliveryCount}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>In Transit</span>
        <span className="font-bold text-blue-500">{inTransitCount}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>Delivered</span>
        <span className="font-bold text-green-600">{deliveredCount}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>Not delivered</span>
        <span className="font-bold text-red-600">{notdeliveredCount}</span>
      </div>
    </div>
  </CardContent>
</Card>

<Card>
  <CardContent className="p-4">
    <div className="text-2xl font-bold text-green-600">R{totalRevenue.toFixed(2)}</div>
    <div className="text-sm text-muted-foreground">Total Revenue</div>
  </CardContent>
</Card>

</div>


        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders or customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderId || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerInfo?.name || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">{order.customerInfo?.phone || order.phone || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {(order.items || []).map((item, index) => (
                          <div key={index}>
                            {item.name || item.productName || 'Product'} x{item.quantity || 1}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">R{(order.total || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <Badge className={getPaymentMethodBadgeClassName(order.paymentMethod)}>
                        {order.paymentMethod || 'N/A'}
                      </Badge>
                        <Badge className={getStatusBadgeClassName(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDeliveryStatusBadgeClassName(order.deliveryStatus)}>
                        {order.deliveryStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{order.orderDate || order.createdAt || 'N/A'}</div>
                      {order.deliveryDate && (
                        <div className="text-muted-foreground">Delivered: {order.deliveryDate}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {/* <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                         */}
                        <Button variant="outline" size="sm"  onClick={() => navigate(`/admin/orders/edit/${order.id}`)}>
                            <FileText className="h-4 w-4" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/invoice/${order.id}`}>
                            <FileText className="h-4 w-4" /> Download Invoice
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredOrders.length === 0 && (
          <Card className="py-12 mt-6">
            <CardContent className="text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Orders will appear here once customers start purchasing"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;