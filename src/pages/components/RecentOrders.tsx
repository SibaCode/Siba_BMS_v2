import React, { useState, useEffect } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { getAuth } from "firebase/auth";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShoppingCart, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const fetchOrders = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "orders"),
        where("createdBy", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      setOrders(items);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Skeleton Loader Component
  const SkeletonOrder = () => (
    <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 animate-pulse bg-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200"></div>
        <div className="flex flex-col gap-1">
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
          <div className="w-16 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex flex-col gap-1 items-end">
        <div className="w-12 h-4 bg-gray-200 rounded"></div>
        <div className="w-16 h-3 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden bg-white">
        {/* Header */}
        <CardHeader className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            Recent Orders
          </CardTitle>
          <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
            {orders.length} total
          </Badge>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
          {loading &&
            Array(5)
              .fill(0)
              .map((_, i) => <SkeletonOrder key={i} />)}

          {!loading && orders.length === 0 && (
            <div className="text-gray-400 text-center py-8">No orders found.</div>
          )}

          {!loading &&
            orders.slice(0, 5).map(order => (
              <motion.div
                key={order.docId}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:shadow-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      order.deliveryStatus === "delivered"
                        ? "bg-green-100"
                        : "bg-amber-100"
                    }`}
                  >
                    {order.deliveryStatus === "delivered" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="font-semibold text-gray-900">{order.orderId}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={order.deliveryStatus === "delivered" ? "default" : "secondary"}
                        className="text-xs font-medium"
                      >
                        {order.deliveryStatus || "Pending"}
                      </Badge>
                      <span className="text-sm text-gray-500">{order.customerInfo?.name || "Unknown"}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 text-lg">R{order.total}</div>
                  <div className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</div>
                </div>
              </motion.div>
            ))}

          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full mt-4 rounded-lg border-gray-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
          >
            <Link to="/admin/orders">View All Orders</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecentOrders;
