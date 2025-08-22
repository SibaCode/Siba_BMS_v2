import React, { useEffect, useState } from "react";
import { getDocs, collection, query } from "firebase/firestore";
import { db } from "@/firebase";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Layers, CheckCircle, Clock, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
};

const ServicesOverview = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "services"));
      const snapshot = await getDocs(q);
      setServices(snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const active = services.filter(s => s.status === "active").length;
  const pending = services.filter(s => s.status === "pending").length;
  const completed = services.filter(s => s.status === "completed").length;

  // Skeleton loader for cards
  const SkeletonCard = () => (
    <div className="p-4 rounded-lg border bg-gray-100 animate-pulse h-20" />
  );

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden bg-white card-hover">
        <CardHeader className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Layers className="h-5 w-5 text-purple-500" />
            Services Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg border bg-purple-50 flex flex-col items-start hover:shadow-lg transition-colors duration-200"
              >
                <Briefcase className="h-5 w-5 text-purple-600 mb-1" />
                <span className="text-lg font-bold">{services.length}</span>
                <span className="text-xs text-muted-foreground">Total</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg border bg-green-50 flex flex-col items-start hover:shadow-lg transition-colors duration-200"
              >
                <CheckCircle className="h-5 w-5 text-green-600 mb-1" />
                <span className="text-lg font-bold">{completed}</span>
                <span className="text-xs text-muted-foreground">Completed</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg border bg-amber-50 flex flex-col items-start hover:shadow-lg transition-colors duration-200"
              >
                <Clock className="h-5 w-5 text-amber-600 mb-1" />
                <span className="text-lg font-bold">{pending}</span>
                <span className="text-xs text-muted-foreground">Pending</span>
              </motion.div>
            </div>
          )}

          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full mt-4 rounded-lg border-gray-300 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
          >
            <Link to="/admin/services">Manage Services</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServicesOverview;
