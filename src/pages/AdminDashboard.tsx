
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Eye
} from "lucide-react";

const AdminDashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        const customersSnapshot = await getDocs(collection(db, "customers"));

        setTotalProducts(productsSnapshot.size);
        setTotalOrders(ordersSnapshot.size);
        setTotalCustomers(customersSnapshot.size);
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/admin/inventory" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/orders" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Orders
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/store">
            View Store
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : totalProducts}</div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Active in inventory</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : totalOrders}</div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>All time orders</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : totalCustomers}</div>
            <p className="text-sm text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R12,340</div>
            <div className="flex items-center space-x-1 text-sm text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Low Stock Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Premium Aprons</span>
                <Badge variant="destructive">3 left</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Travel Umbrellas</span>
                <Badge variant="destructive">2 left</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Limited Edition Mugs</span>
                <Badge variant="destructive">1 left</Badge>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full mt-3">
                <Link to="/admin/inventory">
                  View All Inventory
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Recent Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">Order #1234</div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
                <div className="text-sm font-semibold">R450</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">Order #1235</div>
                  <div className="text-xs text-muted-foreground">5 hours ago</div>
                </div>
                <div className="text-sm font-semibold">R230</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">Order #1236</div>
                  <div className="text-xs text-muted-foreground">1 day ago</div>
                </div>
                <div className="text-sm font-semibold">R180</div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full mt-3">
                <Link to="/admin/orders">
                  View All Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Overview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Custom T-Shirt</TableCell>
                <TableCell>Apparel</TableCell>
                <TableCell>45</TableCell>
                <TableCell>R120</TableCell>
                <TableCell><Badge variant="secondary">Active</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Coffee Mug</TableCell>
                <TableCell>Drinkware</TableCell>
                <TableCell>23</TableCell>
                <TableCell>R65</TableCell>
                <TableCell><Badge variant="secondary">Active</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Premium Apron</TableCell>
                <TableCell>Kitchen</TableCell>
                <TableCell className="text-orange-600 font-medium">3</TableCell>
                <TableCell>R95</TableCell>
                <TableCell><Badge variant="outline">Low Stock</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link to="/admin/inventory">
                View Full Inventory
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
