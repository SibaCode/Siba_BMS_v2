import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Phone, Mail, Users, ArrowLeft, Search } from "lucide-react";

const auth = getAuth();

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    email: "",
    location: "",
    name: "",
    notes: 0,
    phone: "",
    preferredContactMethod: 0,
    referredBy: "",
    status: "active",
    joinDate: new Date().toISOString().split("T")[0],
    totalOrders: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUserId(user.uid);
      else {
        setCurrentUserId(null);
        setCustomers([]);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    setLoading(true);

    const customersRef = collection(db, "customers");
    const q = query(customersRef, where("uid", "==", currentUserId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const custs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomers(custs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const getSafeValue = (value: any) =>
    typeof value === "string" || typeof value === "number" ? value : "N/A";

  const filteredCustomers = customers.filter(customer => {
    const name = getSafeValue(customer.name).toString().toLowerCase();
    const phone = getSafeValue(customer.phone).toString();
    const email = getSafeValue(customer.email).toString().toLowerCase();
    const search = searchTerm.toLowerCase();

    return name.includes(search) || phone.includes(search) || email.includes(search);
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "vip":
        return "destructive";
      case "active":
        return "secondary";
      default:
        return "default";
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setNewCustomer(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveNewCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.email.trim()) {
      alert("Name and Email are required.");
      return;
    }

    try {
      const customerToAdd = { ...newCustomer, uid: currentUserId };
      const docRef = await addDoc(collection(db, "customers"), customerToAdd);
      setCustomers(prev => [...prev, { id: docRef.id, ...customerToAdd }]);
      setNewCustomer({
        email: "",
        location: "",
        name: "",
        notes: 0,
        phone: "",
        preferredContactMethod: 0,
        referredBy: "",
        status: "active",
        joinDate: new Date().toISOString().split("T")[0],
        totalOrders: 0,
        totalSpent: 0,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer, please try again.");
    }
  };

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
            <Button onClick={() => setIsModalOpen(true)} size="sm" variant="destructive">
              + New Customer
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-muted-foreground">Loading customers...</div>
        )}

        {/* Customer Cards */}
        {!loading && filteredCustomers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map(customer => (
              <Card
                key={customer.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="bg-gradient-to-r from-orange-50 to-white p-4">
                  <CardTitle className="flex justify-between items-center">
                    <span className="font-semibold">{getSafeValue(customer.name)}</span>
                    <Badge variant={getStatusBadgeVariant(customer.status)}>
                      {getSafeValue(customer.status)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{getSafeValue(customer.phone)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{getSafeValue(customer.email)}</span>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Joined: {getSafeValue(customer.joinDate)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No customers */}
        {!loading && filteredCustomers.length === 0 && (
          <Card className="py-12 mt-6 text-center">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Customers will appear here once they start making purchases"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full p-6 overflow-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Create New Customer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Name</label>
                <Input value={newCustomer.name} onChange={(e) => handleInputChange("name", e.target.value)} />
              </div>
              <div>
                <label className="block font-medium mb-1">Email</label>
                <Input value={newCustomer.email} onChange={(e) => handleInputChange("email", e.target.value)} />
              </div>
              <div>
                <label className="block font-medium mb-1">Phone</label>
                <Input value={newCustomer.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
              </div>
              <div>
                <label className="block font-medium mb-1">Location</label>
                <Input value={newCustomer.location} onChange={(e) => handleInputChange("location", e.target.value)} />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleSaveNewCustomer}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
