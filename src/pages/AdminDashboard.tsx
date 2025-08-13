import React, { useState, useEffect , useMemo } from "react";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { collection, getDocs , query, where  } from "firebase/firestore";
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
import { InventoryOverview } from "@/pages/components/InventoryOverview";
import RecentOrders from "@/pages/components/RecentOrders";
import CustomerOverview from "@/pages/components/CustomerOverview";

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













  const [totalProducts, setTotalProducts] = useState(0);
  // const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Calculate dynamic stats
  const lowStockCategories = stockOverviewData.filter(item => item.isLowStock).length;
  const totalStockItems = stockOverviewData.reduce((sum, item) => sum + item.units, 0);
  // const deliveredOrders = orderStatusData.find(item => item.status === 'Delivered')?.count || 0;
  // const notDeliveredOrders = orderStatusData.find(item => item.status === 'Not Delivered')?.count || 0;
  const paidAmount = paymentStatusData.find(item => item.status === 'paid')?.count || 0;
  const [businessInfo, setBusinessInfo] = useState<any[]>([]);


  const auth = getAuth();
  const currentUser = auth.currentUser;
  const fetchCollection = async (colName: string, setter: Function) => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, colName),
        where("uid", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setter(items);
    } catch (error) {
      console.error(`Error fetching ${colName}:`, error);
    }
  };
  useEffect(() => {
    async function fetchBusinessInfo() {
      try {
        const businessInfoCol = collection(db, "businessInfo");  
        const businessInfoSnapshot = await getDocs(businessInfoCol);
        const businessInfoList = businessInfoSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBusinessInfo(businessInfoList);
        console.log(businessInfoList)
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchBusinessInfo();
  }, []);


  const [todaySales] = useState(850);
  const [monthlyRevenue] = useState(12340);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
console.log(products)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        const customersSnapshot = await getDocs(collection(db, "customers"));
        console.log(productsSnapshot)

        setTotalProducts(productsSnapshot.size);
        setTotalCustomers(customersSnapshot.size);
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
 ;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const items = querySnapshot.docs.map(doc => ({
      docId: doc.id, 
      ...doc.data()
    }));
      console.log(items)
      setProducts(items);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const items = querySnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data(),
      }));
      console.log("Orders:", items);
      setOrders(items);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "customers"));
      const items = querySnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data(),
      }));
      console.log("Customers:", items);
      setCustomers(items);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (currentUser) {
      Promise.all([
        fetchCollection("products", setProducts),
        fetchCollection("orders", setOrders),
        fetchCollection("customers", setCustomers),
        fetchCollection("businessInfo", setBusinessInfo),
      ]).finally(() => setLoading(false));
    }
  }, [currentUser]);

  // ====== Calculations ======
  const totalUnits = useMemo(
    () =>
      products.reduce(
        (total, product) =>
          total +
          product.variants.reduce(
            (sum: number, v: any) => sum + (v.stockQuantity || 0),
            0
          ),
        0
      ),
    [products]
  );
const lowStockThreshold = 10;

const categoryStock = products.reduce((acc, product) => {
  const totalStockForProduct = product.variants.reduce(
    (sum, variant) => sum + (variant.stockQuantity || 0),
    0
  );
  if (acc[product.category]) {
    acc[product.category] += totalStockForProduct;
  } else {
    acc[product.category] = totalStockForProduct;
  }
  return acc;
}, {} as Record<string, number>);

// Convert to array and add isLow flag
const categoryStockSummary = Object.entries(categoryStock).map(
  ([category, totalStock]: [string, number]) => ({
    category,
    totalStock,
    isLow: totalStock < lowStockThreshold,
  })
);
const totalStock = categoryStockSummary.reduce(
  (sum, { totalStock }) => sum + totalStock,
  0
);
const lowStockCount = categoryStockSummary.filter(c => c.isLow).length;
const totalOrders = orders.length;

const paidOrders = orders.filter(o => o.paymentStatus?.toLowerCase() === "paid");
const pendingPayments = orders.filter(o => o.paymentStatus?.toLowerCase() === "pending");
const failedPayments = orders.filter(o => o.paymentStatus?.toLowerCase() === "failed");
const processingPayments = orders.filter(o => o.paymentStatus?.toLowerCase() === "processing");
console.log(paidOrders)
const deliveredOrders = orders.filter(
  o =>
    o.deliveryStatus?.toLowerCase() === "delivered" ||
    o.status?.toLowerCase() === "delivered"
);
const notDeliveredOrders = orders.length - deliveredOrders.length;

const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);


const newCustomers = customers.length
  // Flatten variants for the table
  const flattenedVariants = products.flatMap((product) =>
    product.variants.map((variant) => ({
      docId: product.docId,
      name: product.name,
      category: product.category,
      variantType: variant.type,
      size: variant.size,
      color: variant.color,
      stockQuantity: variant.stockQuantity,
      sellingPrice: variant.sellingPrice,
      productImage: product.productImage,
      status: variant.stockQuantity <= 5 ? "Low Stock" : product.status,
    }))
  );

  // Filter based on search input (checks name, category, variantType, color, size)
  const filteredVariants = flattenedVariants.filter((item) =>
    [
      item.name,
      item.category,
      item.variantType,
      item.color,
      item.size,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );


  const LOW_STOCK_THRESHOLD = 5; // define what "low stock" means

  // Calculate total units across all products
  // const totalUnits = products.reduce(
  //   (total, product) =>
  //     total +
  //     product.variants.reduce((sum, variant) => sum + (variant.stockQuantity || 0), 0),
  //   0
  // );
  const paidOrdersCount = useMemo(
    () =>
      orders.filter(
        (order) => order.paymentStatus?.toLowerCase() === "paid"
      ).length,
    [orders]
  );

  const newCustomersCount = customers.length;

  const productStockInfo = useMemo(
    () =>
      products.map(product => {
        const units = product.variants.reduce(
          (sum: number, v: any) => sum + (v.stockQuantity || 0),
          0
        );
        const hasLowStock = product.variants.some(
          v => (v.stockQuantity || 0) < LOW_STOCK_THRESHOLD
        );
        return {
          name: product.name,
          units,
          hasLowStock,
        };
      }),
    [products]
  );

  // For each product, get units and low stock status
  // const productStockInfo = products.map(product => {
  //   const units = product.variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
  //   const hasLowStock = product.variants.some(v => (v.stockQuantity || 0) < LOW_STOCK_THRESHOLD);
  //   return {
  //     name: product.name,
  //     units,
  //     hasLowStock,
  //   };
  // });
  // const paidOrdersCount = React.useMemo(() => {
  //   return orders.filter(order => order.paymentStatus?.toLowerCase() === "paid").length;
  // }, [orders]);


  const statsCards = [
    {
      title: "Total Stock Items",
      value: `${totalUnits} units`,
      description: "of inventory",
      icon: Package,
      color: "from-blue-500 to-blue-600",
      details: productStockInfo,
    },
    {
      title: "Total Orders",
      value: `${orders.length} orders`,
      description: "received",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Paid Orders",
      value: `${paidOrdersCount}`,
      description: "orders paid",
      icon: CreditCard,
      color: "from-green-500 to-green-600",
    },
    {
      title: "New Customers",
      value: loading ? "..." : newCustomersCount,
      description: "Recently joined",
      icon: UserPlus,
      color: "from-amber-500 to-orange-600",
    }
  ];

  return (
    <motion.div 
      className="space-y-4 sm:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

           <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
            >
              {statsCards.map((stat, index) => (
                <motion.div key={stat.title} variants={cardVariants}>
                  <Card className="card-hover card-gradient border-0 shadow-elegant overflow-hidden relative">
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-3xl`} />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                        <stat.icon className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-sm text-muted-foreground mb-2">{stat.description}</div>
                      <div className="text-xs text-green-600 font-medium">{stat.change}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            <InventoryOverview />

            <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
      >
       
       <CustomerOverview  />


        <RecentOrders />
      </motion.div> 
      
      {/* Complete Inventory Overview */}
 

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
              {/* <Link to="/admin/finance/expenses">
                <Button variant="outline" className="w-full h-auto p-3 sm:p-4 flex flex-col gap-1 sm:gap-2">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">View Reports</span>
                </Button>
              </Link> */}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
