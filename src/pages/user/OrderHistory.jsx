import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";

export default function OrderHistory() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:5000/api/orders/myorders", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();

        // Check if the response has the expected structure
        if (!data.success || !Array.isArray(data.orders)) {
          throw new Error("Invalid response format from server");
        }

        setOrders(data.orders);
      } catch (err) {
        setError(err.message);
        if (err.message.includes('Invalid response')) {
          console.error('Server response:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handlePayment = async (order) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to proceed with payment");
        navigate("/login");
        return;
      }

      setLoading(true);

      // Create payment session with all required fields
      const paymentResponse = await fetch(
        "http://localhost:5000/api/payments/create",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            orderId: order._id,
            amount: order.totalAmount,
            email: user.email, // Need to get user email from context
            description: `Payment for Order #${order._id.slice(-6)}`,
            successUrl: `${window.location.origin}/payment-success?orderId=${order._id}`,
            cancelUrl: `${window.location.origin}/payment-failed?orderId=${order._id}`
          })
        }
      );

      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || "Payment initialization failed");
      }

      // Store order ID for verification after payment
      localStorage.setItem("pendingOrderId", order._id);

      // Redirect to PayMongo checkout page
      if (paymentData.checkoutUrl) {
        window.location.href = paymentData.checkoutUrl;
      } else {
        throw new Error("Invalid payment response");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;
  if (error)
    return (
      <div className="text-center text-red-500 py-8">
        Error: {error}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found</p>
          <Link
            to="/shop"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Order #{order._id.slice(-6)}</p>
                  <p className="text-sm text-gray-500">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    Total: ${order.totalAmount.toFixed(2)}
                  </p>
                  <p
                    className={`text-sm ${
                      order.status === "completed"
                        ? "text-green-600"
                        : order.status === "cancelled"
                        ? "text-red-600"
                        : order.paymentStatus === "pending"
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <Link
                  to={`/orders/${order._id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Order Details →
                </Link>

                {/* Show Pay Now button for pending/unpaid orders */}
                {(order.paymentStatus === "pending" || !order.paymentStatus) && (
                  <button
                    onClick={() => handlePayment(order)}
                    disabled={loading}
                    className={`${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#B84937] hover:bg-[#9E3C2D]"
                    } text-white px-4 py-2 rounded-md transition-colors text-sm`}
                  >
                    {loading ? "Processing..." : "Pay Now"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
