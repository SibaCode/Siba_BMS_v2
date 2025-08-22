import React, { useEffect, useState } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
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
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "services"));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setServices(items);
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

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card className="card-hover shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-purple-500" />
            <span>Services Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-purple-50 flex flex-col items-start">
              <Briefcase className="h-5 w-5 text-purple-600 mb-1" />
              <span className="text-lg font-bold">{services.length}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>

            <div className="p-4 rounded-lg bg-green-50 flex flex-col items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mb-1" />
              <span className="text-lg font-bold">{completed}</span>
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 flex flex-col items-start">
              <Clock className="h-5 w-5 text-amber-600 mb-1" />
              <span className="text-lg font-bold">{pending}</span>
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="w-full mt-4 card-hover">
            <Link to="/admin/services">Manage Services</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServicesOverview;
