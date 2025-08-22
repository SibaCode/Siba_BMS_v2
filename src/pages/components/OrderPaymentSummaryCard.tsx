import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Truck, CreditCard, CheckCircle, Clock } from "lucide-react";
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

const OrderPaymentSummaryCard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

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
    if (!currentUid) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "orders"), where("createdBy", "==", currentUid));
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUid]);

  // Delivery counts
  const deliveredCount = orders.filter(o => o.deliveryStatus === "delivered").length;
  const pendingCount = orders.filter(o => o.deliveryStatus === "pending").length;
  const inTransitCount = orders.filter(o => o.deliveryStatus === "in_transit").length;
  const notDeliveredCount = orders.filter(o => o.deliveryStatus === "not_delivered").length;

  // Payment counts
  const paidCount = orders.filter(o => o.paymentStatus === "paid").length;
  const failedCount = orders.filter(o => o.paymentStatus === "failed").length;
  const processingCount = orders.filter(o => o.paymentStatus === "processing").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden bg-white">
        <CardHeader className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Truck className="h-5 w-5 text-orange-500" />
            Order & Payment Summary
          </CardTitle>
          <span className="text-sm text-gray-500">{orders.length} total orders</span>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          {/* Delivery Status */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Delivery Status
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Pending", count: pendingCount, icon: Clock, color: "text-amber-600" },
                { label: "In Transit", count: inTransitCount, icon: Clock, color: "text-blue-500" },
                { label: "Delivered", count: deliveredCount, icon: CheckCircle, color: "text-green-600" },
                { label: "Not Delivered", count: notDeliveredCount, icon: Clock, color: "text-red-600" },
              ].map(item => (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:shadow-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className={`text-2xl font-bold ${item.color}`}>{item.count}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Status
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Paid", count: paidCount, color: "text-green-600" },
                { label: "Failed", count: failedCount, color: "text-red-600" },
                { label: "Processing", count: processingCount, color: "text-amber-500" },
              ].map(item => (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg border border-gray-100 hover:shadow-lg hover:bg-gray-50 text-center transition-colors duration-200"
                >
                  <div className={`text-lg font-bold ${item.color}`}>{item.count}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="w-full mt-4 rounded-lg border-gray-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700">
            <Link to="/admin/orders">View All Orders</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrderPaymentSummaryCard;
