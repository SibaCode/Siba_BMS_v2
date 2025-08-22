import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Business {
  id: number;
  name: string;
  email: string;
  status: "active" | "pending" | "suspended";
}

export default function Dashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    // Mock fetch
    setBusinesses([
      { id: 1, name: "Alpha Corp", email: "alpha@example.com", status: "active" },
      { id: 2, name: "Beta Ltd", email: "beta@example.com", status: "pending" },
      { id: 3, name: "Gamma Inc", email: "gamma@example.com", status: "suspended" },
    ]);
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "suspended": return "bg-red-100 text-red-800";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">SaaS Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your platform metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="text-gray-500 text-sm">Total Businesses</div>
          <div className="text-2xl font-bold">{businesses.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="text-gray-500 text-sm">Active</div>
          <div className="text-2xl font-bold">{businesses.filter(b => b.status === "active").length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="text-gray-500 text-sm">Pending</div>
          <div className="text-2xl font-bold">{businesses.filter(b => b.status === "pending").length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="text-gray-500 text-sm">Suspended</div>
          <div className="text-2xl font-bold">{businesses.filter(b => b.status === "suspended").length}</div>
        </div>
      </div>

      {/* Business Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map(biz => (
          <div key={biz.id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{biz.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(biz.status)}`}>
                {biz.status}
              </span>
            </div>
            <p className="text-gray-500 mb-4">{biz.email}</p>
            <Button size="sm">Manage</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
