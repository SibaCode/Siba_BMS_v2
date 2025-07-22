import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { collection, getDocs } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/firebase";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Eye,
  Search,
  Filter,
  Calendar,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  UserPlus,
  Truck
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock data for enhanced dashboard
const stockOverviewData = [
  { category: 'Aprons', units: 5, isLowStock: true },
  { category: 'Umbrellas', units: 10, isLowStock: false },
  { category: 'T-Shirts', units: 25, isLowStock: false },
  { category: 'Mugs', units: 3, isLowStock: true },
  { category: 'Bags', units: 18, isLowStock: false },
];

const orderStatusData = [
  { status: 'Delivered', count: 1, color: '#10b981' },
  { status: 'Not Delivered', count: 3, color: '#f59e0b' },
];

const paymentStatusData = [
  { status: 'Paid', count: 15, color: '#10b981' },
  { status: 'Pending', count: 8, color: '#f59e0b' },
  { status: 'Failed', count: 2, color: '#ef4444' },
];

const recentCustomers = [
  { id: 1, name: "John Smith", email: "john@example.com", totalSpent: 250, orderCount: 3, joinedDate: "2024-01-15" },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", totalSpent: 180, orderCount: 2, joinedDate: "2024-01-10" },
  { id: 3, name: "Mike Davis", email: "mike@example.com", totalSpent: 420, orderCount: 5, joinedDate: "2024-01-05" },
  { id: 4, name: "Emily Brown", email: "emily@example.com", totalSpent: 95, orderCount: 1, joinedDate: "2024-01-01" },
];

const recentOrders = [
  { id: "ORD001", customer: "John Smith", items: 3, total: 125, status: "Delivered", date: "2024-01-20" },
  { id: "ORD002", customer: "Sarah Johnson", items: 2, total: 89, status: "Processing", date: "2024-01-19" },
  { id: "ORD003", customer: "Mike Davis", items: 4, total: 210, status: "Shipped", date: "2024-01-18" },
  { id: "ORD004", customer: "Emily Brown", items: 1, total: 45, status: "Pending", date: "2024-01-17" },
];

const inventory = [
  { id: 1, name: "Custom Aprons", category: "Aprons", stock: 5, price: 45, status: "Low Stock" },
  { id: 2, name: "Branded Umbrellas", category: "Umbrellas", stock: 10, price: 65, status: "In Stock" },
  { id: 3, name: "Premium T-Shirts", category: "T-Shirts", stock: 25, price: 85, status: "Active" },
  { id: 4, name: "Coffee Mugs", category: "Mugs", stock: 3, price: 45, status: "Low Stock" },
  { id: 5, name: "Laptop Bags", category: "Bags", stock: 18, price: 150, status: "Active" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0
  }
};

const AdminDashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersCollection = collection(db, "orders");
        const ordersSnapshot = await getDocs(ordersCollection);
        const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);

        const customersCollection = collection(db, "customers");
        const customersSnapshot = await getDocs(customersCollection);
        const customersData = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCustomers(customersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <motion.div 
      className="space-y-4 sm:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-gradient shadow-elegant transition-smooth hover:shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gradient">{inventory.length}</div>
              <p className="text-xs text-muted-foreground">Across all categories</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-gradient shadow-elegant transition-smooth hover:shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gradient">{orders.length || recentOrders.length}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-gradient shadow-elegant transition-smooth hover:shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gradient">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Lifetime earnings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-gradient shadow-elegant transition-smooth hover:shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Avg. Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gradient">${averageOrderValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per order average</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stock Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm sm:text-base">Stock Overview</span>
                </div>
                <Badge variant="secondary" className="sm:ml-auto w-fit">
                  {stockOverviewData.filter(item => item.isLowStock).length} Low Stock
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {stockOverviewData.map((item, index) => (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.isLowStock ? 'bg-warning' : 'bg-success'}`} />
                      <span className="font-medium text-sm sm:text-base">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-base sm:text-lg font-bold">{item.units}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">units</span>
                      {item.isLowStock && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {stockOverviewData.filter(item => item.isLowStock).length} categories need restocking
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order & Payment Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-sm sm:text-base">Order & Payment Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Order Status */}
              <div>
                <h4 className="font-semibold mb-3 text-sm sm:text-base">Order Status</h4>
                <div className="space-y-2 sm:space-y-3">
                  {orderStatusData.map((item, index) => (
                    <motion.div
                      key={item.status}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        {item.status === 'Delivered' ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <Clock className="h-4 w-4 text-warning" />
                        )}
                        <span className="text-sm sm:text-base">{item.status}</span>
                      </div>
                      <Badge variant="outline" className="text-xs sm:text-sm">
                        {item.count}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <h4 className="font-semibold mb-3 text-sm sm:text-base">Payment Status</h4>
                <div className="space-y-2 sm:space-y-3">
                  {paymentStatusData.map((item, index) => (
                    <motion.div
                      key={item.status}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        {item.status === 'Paid' && <CheckCircle className="h-4 w-4 text-success" />}
                        {item.status === 'Pending' && <Clock className="h-4 w-4 text-warning" />}
                        {item.status === 'Failed' && <XCircle className="h-4 w-4 text-destructive" />}
                        <span className="text-sm sm:text-base">{item.status}</span>
                      </div>
                      <Badge variant="outline" className="text-xs sm:text-sm">
                        {item.count}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Recent Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm sm:text-base">Recent Customers</span>
                </div>
                <Badge variant="outline" className="sm:ml-auto w-fit">
                  {recentCustomers.length} New
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {recentCustomers.slice(0, 5).map((customer, index) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + index * 0.1 }}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-secondary/50 transition-smooth"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{customer.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-medium">${customer.totalSpent}</p>
                      <p className="text-xs text-muted-foreground">{customer.orderCount} orders</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <span className="text-sm sm:text-base">Recent Orders</span>
                </div>
                <Link to="/admin/orders">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {recentOrders.slice(0, 5).map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-secondary/50 transition-smooth"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <p className="font-medium text-sm sm:text-base">{order.id}</p>
                        <Badge 
                          variant={order.status === 'Delivered' ? 'default' : 'secondary'}
                          className="text-xs w-fit"
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{order.customer}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-medium">${order.total}</p>
                      <p className="text-xs text-muted-foreground">{order.items} items</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Complete Inventory Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="mb-6 sm:mb-8"
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm sm:text-base">Complete Inventory Overview</span>
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Filter className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add Product</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Product</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Category</TableHead>
                    <TableHead className="text-xs sm:text-sm">Stock</TableHead>
                    <TableHead className="text-xs sm:text-sm">Price</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + index * 0.1 }}
                      className="hover:bg-secondary/50"
                    >
                      <TableCell className="font-medium text-xs sm:text-sm">{item.name}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{item.category}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span>{item.stock}</span>
                          {item.stock < 10 && (
                            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">${item.price}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={item.status === 'In Stock' ? 'default' : 'secondary'} className="text-xs">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                            <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Link to="/admin/orders/create">
                <Button className="w-full h-auto p-3 sm:p-4 flex flex-col gap-1 sm:gap-2">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">Create Order</span>
                </Button>
              </Link>
              <Link to="/admin/inventory">
                <Button variant="outline" className="w-full h-auto p-3 sm:p-4 flex flex-col gap-1 sm:gap-2">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">Manage Inventory</span>
                </Button>
              </Link>
              <Link to="/admin/customers">
                <Button variant="outline" className="w-full h-auto p-3 sm:p-4 flex flex-col gap-1 sm:gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">View Customers</span>
                </Button>
              </Link>
              <Link to="/admin/finance/expenses">
                <Button variant="outline" className="w-full h-auto p-3 sm:p-4 flex flex-col gap-1 sm:gap-2">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">View Reports</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
