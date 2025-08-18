import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Truck, ShoppingCart, CreditCard, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const OrderPaymentSummaryCard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, "orders"),
          where("createdBy", "==", currentUser.uid),
          orderBy("createdAt", "desc") // optional: newest first
        );

        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched orders for current user:", ordersData);
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const normalizedOrders = orders.map(order => ({
    deliveryStatus: order.deliveryStatus?.trim().toLowerCase() || "unknown",
    paymentStatus: order.paymentStatus?.trim().toLowerCase() || "unknown",
  }));

  const orderStatusData = [
    { status: "pending", count: normalizedOrders.filter(o => o.deliveryStatus === "pending").length, color: "#f59e0b" },
    { status: "delivered", count: normalizedOrders.filter(o => o.deliveryStatus === "delivered").length, color: "#10b981" },
    { status: "not_delivered", count: normalizedOrders.filter(o => o.deliveryStatus === "not_delivered").length, color: "#ef4444" },
    { status: "in_transit", count: normalizedOrders.filter(o => o.deliveryStatus === "in_transit").length, color: "#3b82f6" },
  ];

  const paymentStatusData = [
    { status: "paid", count: normalizedOrders.filter(o => o.paymentStatus === "paid").length, color: "#10b981" },
    { status: "failed", count: normalizedOrders.filter(o => o.paymentStatus === "failed").length, color: "#ef4444" },
    { status: "processing", count: normalizedOrders.filter(o => o.paymentStatus === "processing").length, color: "#f59e0b" },
  ];

  if (loading) return <div>Loading summary...</div>;

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
            {orderStatusData.map(item => (
              <div key={item.status} className="p-3 rounded-lg border bg-muted/40 transition hover:shadow">
                <div className="flex items-center gap-2 mb-1">
                  {item.status === "delivered" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-sm font-medium">{item.status.replace("_", " ")}</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: item.color }}>
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
            {paymentStatusData.map(item => (
              <div key={item.status} className="p-3 rounded-lg border bg-muted/40 text-center hover:shadow">
                <div className="text-lg font-bold" style={{ color: item.color }}>
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
