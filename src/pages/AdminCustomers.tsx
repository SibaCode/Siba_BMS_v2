import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Search, 
  Users, 
  Eye,
  Phone,
  Mail
} from "lucide-react";

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - in real app this would come from backend
  const customers = [
    {
      id: 1,
      name: "John Doe",
      phone: "078-123-4567",
      email: "john.doe@email.com",
      totalOrders: 5,
      totalSpent: 567.89,
      lastOrder: "2024-01-15",
      joinDate: "2023-08-15",
      status: "Active"
    },
    {
      id: 2,
      name: "Jane Smith",
      phone: "082-987-6543",
      email: "jane.smith@email.com",
      totalOrders: 3,
      totalSpent: 289.45,
      lastOrder: "2024-01-10",
      joinDate: "2023-11-20",
      status: "Active"
    },
    {
      id: 3,
      name: "Mike Johnson",
      phone: "071-456-7890",
      email: "mike.johnson@email.com",
      totalOrders: 8,
      totalSpent: 1234.56,
      lastOrder: "2024-01-12",
      joinDate: "2023-06-10",
      status: "VIP"
    },
    {
      id: 4,
      name: "Sarah Wilson",
      phone: "079-321-6547",
      email: "sarah.wilson@email.com",
      totalOrders: 1,
      totalSpent: 45.99,
      lastOrder: "2023-12-20",
      joinDate: "2023-12-15",
      status: "New"
    }
  ];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "vip":
        return "default";
      case "active":
        return "secondary";
      case "new":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const totalCustomers = customers.length;
  const vipCustomers = customers.filter(c => c.status === "VIP").length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const avgOrderValue = totalRevenue / customers.reduce((sum, customer) => sum + customer.totalOrders, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Customer Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <div className="text-sm text-muted-foreground">Total Customers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{vipCustomers}</div>
              <div className="text-sm text-muted-foreground">VIP Customers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">R{totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">R{avgOrderValue.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Avg Order Value</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Member since {customer.joinDate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-3 w-3" />
                          <span>{customer.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{customer.totalOrders}</div>
                        <div className="text-xs text-muted-foreground">orders</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">R{customer.totalSpent.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        Avg: R{(customer.totalSpent / customer.totalOrders).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{customer.lastOrder}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(customer.status)}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredCustomers.length === 0 && (
          <Card className="py-12 mt-6">
            <CardContent className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Try adjusting your search criteria"
                  : "Customers will appear here once they start making purchases"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;