import React, { useEffect, useState } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UserPlus, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Customer {
  docId: string;
  name: string;
  email: string;
  orders: number;
  joinDate: string;
  totalSpent?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
};

const CustomerOverview = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "customers"),
        where("uid", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          docId: doc.id,
          name: data.name || "Unknown",
          email: data.email || "-",
          orders: data.totalOrders || 0,
          joinDate: data.joinDate || "N/A",
          totalSpent: data.totalSpent || 0,
        };
      });
      setCustomers(items);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const recentCustomers = customers.slice(0, 5);

  // Skeleton loader
  const SkeletonCard = () => (
    <div className="flex justify-between items-center p-4 rounded-lg border bg-gray-100 animate-pulse h-16" />
  );

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card className="card-hover shadow-elegant rounded-2xl border border-gray-200 overflow-hidden bg-white">
        <CardHeader className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <UserPlus className="h-5 w-5 text-blue-500" />
            Recent Customers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, i) => <SkeletonCard key={i} />)
          ) : recentCustomers.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No customers found.</div>
          ) : (
            <div className="space-y-3">
              {recentCustomers.map((customer, index) => (
                <motion.div
                  key={customer.docId}
                  className="flex justify-between items-center p-4 rounded-lg border hover:shadow-lg transition-colors duration-200 bg-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </div>
                  {/* Placeholder for future stats */}
                  <div className="text-right text-sm text-gray-500 space-y-1">
                    {/* <div>{customer.orders} orders</div>
                    <div>Joined: {customer.joinDate}</div>
                    <div>Spent: R{customer.totalSpent}</div> */}
                  </div>
                </motion.div>
              ))}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full mt-3 rounded-lg border-gray-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                <Link to="/admin/customers">View All Customers</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CustomerOverview;
