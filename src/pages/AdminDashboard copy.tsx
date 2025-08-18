import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase'; // your Firebase config
import { collection, getDocs } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  total: number;
}

interface Customer {
  id: string;
  fullName: string;
  email: string;
}

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch data from Firebase
  const fetchData = async () => {
    setLoading(true);
    try {
      const [productSnap, orderSnap, customerSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'customers')),
      ]);

      setProducts(productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setOrders(orderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setCustomers(customerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = useMemo(() =>
    products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        {/* <Spinner /> */}
      </div>
    );
  }

  return (
    <motion.div
      className="p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={cardVariants} className="mb-6">
        <h2 className="text-xl font-bold mb-2">Products</h2>
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="mb-2"
        />
        {filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </motion.div>

      <motion.div variants={cardVariants} className="mb-6">
        <h2 className="text-xl font-bold mb-2">Orders</h2>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.customerName}</td>
                  <td>${order.total}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </motion.div>

      <motion.div variants={cardVariants}>
        <h2 className="text-xl font-bold mb-2">Customers</h2>
        {customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.fullName}</td>
                  <td>{customer.email}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
