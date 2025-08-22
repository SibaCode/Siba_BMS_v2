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

import {  doc, getDoc } from "firebase/firestore";
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AdminDashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [businessInfo, setBusinessInfo] = useState<any>({});
  console.log(orders)
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const currentUid = currentUser?.uid;
  const [expenses, setExpenses] = useState<any[]>([]);
  const paidOrdersCount = orders.filter((o) => o.paymentStatus === "paid").length;

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      setLoading(true);
  
      try {
        // 1️⃣ Fetch products, orders, customers, expenses in parallel
        const [productsSnapshot, ordersSnapshot, customersSnapshot, expensesSnapshot] = await Promise.all([
          getDocs(query(collection(db, "products"), where("uid", "==", currentUid))),
          getDocs(query(collection(db, "orders"), where("createdBy", "==", currentUid))),
          getDocs(query(collection(db, "customers"), where("uid", "==", currentUid))),
          getDocs(query(collection(db, "expenses"), where("userId", "==", currentUid))), // added
        ]);
  
        // 2️⃣ Map to arrays
        setProducts(productsSnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
        setOrders(ordersSnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
        setCustomers(customersSnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
        setExpenses(expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); // added
  
        setTotalProducts(productsSnapshot.size);
        setTotalOrders(ordersSnapshot.size);
        setTotalCustomers(customersSnapshot.size);
  
        // 3️⃣ Fetch businessInfo document
        const businessDocRef = doc(db, "businessInfo", currentUid);
        const businessDocSnap = await getDoc(businessDocRef);
  
        if (businessDocSnap.exists()) {
          const info = { id: businessDocSnap.id, ...businessDocSnap.data() };
          setBusinessInfo(info);
          console.log("Business Info:", info);
        } else {
          setBusinessInfo({});
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [currentUser, currentUid]);
  
  // ====== Calculations ======
  const lowStockThreshold = businessInfo.lowStockThreshold ?? 5;

  const totalUnits = useMemo(
    () =>
      products.reduce(
        (total: number, product: any) =>
          total +
          product.variants.reduce(
            (sum: number, v: any) => sum + Number(v.stockQuantity || 0),
            0
          ),
        0
      )
      ,
    [products]
  );

  const categoryStockSummary = useMemo(() => {
    const categoryStock = products.reduce((acc, product) => {
      const totalStockForProduct = product.variants.reduce(
        (sum, variant) => sum + (variant.stockQuantity || 0),
        0
      );
      acc[product.category] = (acc[product.category] || 0) + totalStockForProduct;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryStock).map(([category, totalStock]) => ({
      category,
      totalStock,
      isLow: totalStock < lowStockThreshold,
    }));
  }, [products, lowStockThreshold]);

  const totalStock = categoryStockSummary.reduce((sum, c) => sum + c.totalStock, 0);
  const lowStockCount = categoryStockSummary.filter(c => c.isLow).length;

  const paidOrders = orders.filter(o => o.paymentStatus?.toLowerCase() === "paid");
  const pendingPayments = orders.filter(o => o.paymentStatus?.toLowerCase() === "pending");
  const failedPayments = orders.filter(o => o.paymentStatus?.toLowerCase() === "failed");
  const deliveredOrders = orders.filter(
    o => o.deliveryStatus?.toLowerCase() === "delivered" || o.status?.toLowerCase() === "delivered"
  );
  const notDeliveredOrders = orders.length - deliveredOrders.length;

  const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const profit = totalRevenue - totalExpenses;
  
  const flattenedVariants = products.flatMap(product =>
    product.variants.map(variant => ({
      docId: product.docId,
      name: product.name,
      category: product.category,
      variantType: variant.type,
      size: variant.size,
      color: variant.color,
      stockQuantity: variant.stockQuantity,
      sellingPrice: variant.sellingPrice,
      productImage: product.productImage,
      status: variant.stockQuantity <= lowStockThreshold ? "Low Stock" : product.status,
    }))
  );

  const filteredVariants = flattenedVariants.filter(item =>
    [item.name, item.category, item.variantType, item.color, item.size]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  const newCustomersCount = customers.length;
  const productStockInfo = useMemo(
    () =>
      products.map(product => {
        const units = product.variants.reduce(
          (sum: number, v: any) => sum + (v.stockQuantity || 0),
          0
        );
        const hasLowStock = product.variants.some(v => (v.stockQuantity || 0) < lowStockThreshold);
        return { name: product.name, units, hasLowStock };
      }),
    [products, lowStockThreshold]
  );


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
      title: "Low Stock Products",
      value: `${lowStockCount} items`,
      description: `below threshold (${businessInfo.lowStockThreshold ?? 5})`,
      icon: AlertTriangle,
      color: "from-red-500 to-rose-600",
      details: productStockInfo.filter(p => p.hasLowStock),
    },
    // {
    //   title: "Total Orders",
    //   value: `${totalOrders} orders`,
    //   description: "received",
    //   icon: CheckCircle,
    //   color: "from-green-500 to-emerald-600",
    // },
    {
      title: "Paid Orders",
      value: `${paidOrdersCount}`,
      description: "orders paid",
      icon: CreditCard,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Finance Overview",
      value: `R${totalRevenue}`,
      description: `Profit: R${profit} | Expenses: R${totalExpenses}`,
      icon: DollarSign,
      color: "from-green-500 to-teal-600",
    }
    
    // {
    //   title: "New Customers",
    //   value: loading ? "..." : newCustomersCount,
    //   description: "Recently joined",
    //   icon: UserPlus,
    //   color: "from-amber-500 to-orange-600",
    // },
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
                      {/* <div className="text-xs text-green-600 font-medium">{stat.change}</div> */}
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
       <RecentOrders />
       <CustomerOverview  />
       
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
