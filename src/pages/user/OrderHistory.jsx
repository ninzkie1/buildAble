import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import Chat from '../../components/Chat';
import { MessageCircle } from 'lucide-react';

export default function OrderHistory() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChatSeller, setActiveChatSeller] = useState(null);
  const [activeChatOrder, setActiveChatOrder] = useState(null);
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

  const handleStartChat = (sellerId, orderId) => {
    setActiveChatSeller(sellerId);
    setActiveChatOrder(orderId);
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;
  if (error)
    return (
      <div className="text-center text-red-500 py-8">
        Error: {error}
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-medium">{order._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-medium">₱{order.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">{order.status}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/orders/${order._id}`}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  View Details
                </Link>
                <Link
                  to={`/track-order/${order._id}`}
                  className="px-4 py-2 text-sm bg-[#B84937] text-white hover:bg-[#9E3C2D] rounded-lg transition"
                >
                  Track Order
                </Link>
                <button
                  onClick={() => handleStartChat(order.items[0].product.seller, order._id)}
                  className="px-4 py-2 text-sm bg-green-500 text-white hover:bg-green-600 rounded-lg transition flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  Contact Seller
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {activeChatSeller && (
        <Chat
          sellerId={activeChatSeller}
          orderId={activeChatOrder}
          onClose={() => {
            setActiveChatSeller(null);
            setActiveChatOrder(null);
          }}
        />
      )}
    </div>
  );
}
