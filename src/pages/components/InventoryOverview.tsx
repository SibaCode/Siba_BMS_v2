import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OrderPaymentSummaryCard from "./OrderPaymentSummaryCard";

interface Variant {
  type: string;
  size?: string;
  color?: string;
  stockQuantity: number;
}

interface Product {
  docId: string;
  name: string;
  category: string;
  variants: Variant[];
}

const InventoryOverview = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const lowStockThreshold = 8;

  const fetchProducts = async (uid: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, "products"), where("uid", "==", uid));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchProducts(user.uid);
      } else {
        setCurrentUser(null);
        setProducts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const lowStockCategories = products.filter(product => {
    const totalStock = product.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
    return totalStock <= lowStockThreshold;
  }).length;

  // Skeleton loader
  const SkeletonProduct = () => (
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Stock Overview */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden bg-white">
          <CardHeader className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Package className="h-5 w-5 text-orange-500" />
              Stock Overview
            </CardTitle>
            <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
              {products.length} products
            </Badge>
          </CardHeader>

          <CardContent className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
            {loading &&
              Array(5)
                .fill(0)
                .map((_, i) => <SkeletonProduct key={i} />)}

            {!loading && products.length === 0 && (
              <div className="text-gray-400 text-center py-8">No products found.</div>
            )}

            {!loading &&
              products.map((product, index) => {
                const totalStock = product.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) || 0;
                const isLowStock = totalStock <= lowStockThreshold;

                return (
                  <motion.div
                    key={product.docId}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:shadow-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isLowStock ? "bg-red-500" : "bg-green-500"}`} />
                      <span className="font-medium capitalize">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{totalStock} units</div>
                      {isLowStock && (
                        <Badge variant="destructive" className="text-xs">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })}

            {lowStockCategories > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {lowStockCategories} {lowStockCategories === 1 ? "category" : "categories"} low in stock
                </span>
              </div>
            )}

            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full mt-4 rounded-lg border-gray-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
            >
              <Link to="/admin/inventory">View All Inventory</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Order & Payment Summary */}
      <OrderPaymentSummaryCard />
    </div>
  );
};

export default InventoryOverview;
