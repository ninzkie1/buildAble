import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config/config";
import { AuthContext } from "../../context/AuthContext";

export default function DeliveryRiderDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Check if user is a rider
  useEffect(() => {
    if (user && user.role !== 'rider') {
      // Redirect non-riders to their appropriate dashboard
      if (user.role === 'seller') {
        navigate('/sellerHome');
      } else {
        navigate('/userHome');
      }
    }
  }, [user, navigate]);

  // Don't render if user is not a rider
  if (user && user.role !== 'rider') {
    return null;
  }

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${config.apiUrl}/api/rider/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      } else {
        console.error(data.message || "Failed to load rider orders");
      }
    } catch (err) {
      console.error("Error loading rider orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdate = async (orderId, outcome) => {
    if (!window.confirm(`Mark this order as ${outcome}?`)) return;
    try {
      setUpdatingId(orderId);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("outcome", outcome);
      if (selectedImage) {
        formData.append("proofImage", selectedImage);
      }
      const res = await fetch(
        `${config.apiUrl}/api/rider/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? data.order : o))
        );
        setSelectedImage(null);
      } else {
        alert(data.message || "Failed to update order");
      }
    } catch (err) {
      console.error("Error updating rider order:", err);
      alert("Error updating order");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B84937]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Delivery Rider Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Confirm deliveries: Mark COD as paid, or mark online orders as delivered.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Orders Ready for Delivery
        </h2>
        <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <label className="text-sm font-medium text-gray-700">
            Optional proof photo:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
            className="text-sm"
          />
          {selectedImage && (
            <span className="text-xs text-gray-500">
              Selected: {selectedImage.name}
            </span>
          )}
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">
            No orders awaiting delivery right now.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Order</th>
                  <th className="text-left py-2 pr-4">Customer</th>
                  <th className="text-left py-2 pr-4">Total</th>
                  <th className="text-left py-2 pr-4">Payment Method</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2 pr-4">Payment Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b">
                    <td className="py-2 pr-4">
                      <div className="font-medium text-gray-800">
                        #{order._id.slice(-6)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="text-gray-800">
                        {order.user?.name || "Customer"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.shippingAddress?.city}
                      </div>
                    </td>
                    <td className="py-2 pr-4 font-semibold text-gray-900">
                      ₱{Number(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs capitalize ${
                        order.paymentMethod === 'cod' 
                          ? 'bg-orange-50 text-orange-700' 
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs capitalize bg-blue-50 text-blue-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs capitalize bg-yellow-50 text-yellow-700">
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        {order.paymentMethod === 'cod' ? (
                          // COD order: Mark as Paid button
                          <button
                            onClick={() => handleUpdate(order._id, "paid")}
                            disabled={
                              updatingId === order._id ||
                              order.status === "delivered" ||
                              order.paymentStatus === "paid"
                            }
                            className="px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            {updatingId === order._id ? "Saving..." : "Mark as Paid"}
                          </button>
                        ) : (
                          // Online order: Mark as Delivered button
                          <button
                            onClick={() => handleUpdate(order._id, "delivered")}
                            disabled={
                              updatingId === order._id ||
                              order.status === "delivered"
                            }
                            className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            {updatingId === order._id ? "Saving..." : "Mark as Delivered"}
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdate(order._id, "cancelled")}
                          disabled={
                            updatingId === order._id ||
                            order.status === "cancelled"
                          }
                          className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
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


