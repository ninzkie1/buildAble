import React, { useEffect, useState } from "react";
import config from "../../config/config";

export default function SellerCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const response = await fetch(
          `${config.apiUrl}/api/seller/orders?page=1&limit=1000`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to load customers");
        }

        const orders = data.orders || [];
        const map = new Map();

        orders.forEach((order) => {
          if (!order.user) return;
          const id = order.user._id || order.user.id || order.user;
          const key = String(id);

          const totalAmount = order.totalAmount || 0;

          if (!map.has(key)) {
            map.set(key, {
              id: key,
              name: order.user.name || "Customer",
              email: order.user.email || "",
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: order.createdAt || order.updatedAt,
            });
          }

          const entry = map.get(key);
          entry.totalOrders += 1;
          entry.totalSpent += totalAmount;
          const orderDate = new Date(order.createdAt || order.updatedAt);
          if (!entry.lastOrderDate || orderDate > new Date(entry.lastOrderDate)) {
            entry.lastOrderDate = orderDate.toISOString();
          }
        });

        const list = Array.from(map.values()).sort(
          (a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate)
        );

        setCustomers(list);
      } catch (err) {
        console.error("Error loading seller customers:", err);
        setError(err.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B84937]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Customers</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
            {error}
          </div>
        )}

        {customers.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
            No customers yet.
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Total Orders</th>
                  <th className="text-left py-2">Total Spent</th>
                  <th className="text-left py-2">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b">
                    <td className="py-2 font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="py-2 text-gray-700">{customer.email}</td>
                    <td className="py-2">{customer.totalOrders}</td>
                    <td className="py-2">
                      ₱{Number(customer.totalSpent || 0).toFixed(2)}
                    </td>
                    <td className="py-2 text-gray-600">
                      {customer.lastOrderDate
                        ? new Date(customer.lastOrderDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


