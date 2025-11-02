import React, { useState, useContext, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AddressModal from "../components/AddressModal";
import config from "../config/config";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const navigate = useNavigate();

  // Calculate subtotal (items total)
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculate 2% transaction fee
  const transactionFee = subtotal * 0.02;

  // Calculate final total (subtotal + transaction fee)
  const totalAmount = subtotal + transactionFee;

  // Fetch user profile when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          `${config.apiUrl}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const data = await response.json();
        if (data.address) {
          setUserAddress(data.address);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    if (user?.token) {
      fetchUserProfile();
    }
  }, [user]);

  const handleAddressSave = async (address) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.apiUrl}/api/users/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save address");
      }

      const data = await response.json();
      setUserAddress(data.user.address);
      setShowAddressModal(false);
      // Proceed with checkout
      processCheckout(data.user.address);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!user || !user.token) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }

    // Check if user has address - Changed from toast.info to toast
    if (!userAddress || !userAddress.street || !userAddress.city) {
      toast('Please add your delivery address', {
        icon: '📍',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      setShowAddressModal(true);
      return;
    }

    processCheckout(userAddress);
  };

  const processCheckout = async (address) => {
    try {
      setLoading(true);
      setError("");

      // Ensure address is complete
      if (!address || !address.street || !address.city || !address.state || !address.postalCode || !address.country) {
        toast.error("Please provide complete shipping address");
        setShowAddressModal(true);
        return;
      }

      const orderResponse = await fetch(
        `${config.apiUrl}/api/orders/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            items: cart.map((item) => ({
              product: item._id,
              quantity: item.quantity,
              price: item.price,
            })),
            address: {
              street: address.street,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country
            },
            paymentMethod
            // Removed status and paymentStatus override since they will be handled by backend
          }),
        }
      );

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Failed to create order");
      }

      if (paymentMethod === 'cod') {
        // Handle COD order
        clearCart();
        toast.success('Order placed successfully! (Cash on Delivery)');
        navigate('/orders');
        return;
      }

      // Continue with online payment flow
      const paymentResponse = await fetch(
        `${config.apiUrl}/api/payments/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            orderId: orderData.order._id,
            amount: totalAmount,
            email: user.email,
            successUrl: `${window.location.origin}/payment-success?orderId=${orderData.order._id}`,
            cancelUrl: `${window.location.origin}/payment-failed?orderId=${orderData.order._id}`,
          }),
        }
      );

      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || "Payment initialization failed");
      }

      localStorage.setItem("pendingOrderId", orderData.order._id);

      if (paymentData.checkoutUrl) {
        window.location.href = paymentData.checkoutUrl;
      } else {
        throw new Error("Invalid payment response");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message);
      toast.error(err.message || "Failed to process checkout");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Your cart is empty 🛒
        </h2>
        <Link
          to="/"
          className="px-6 py-3 bg-[#B84937] text-white rounded-lg hover:bg-[#9E3C2D] transition"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Your Cart</h2>

        {/* Show error message if exists */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row items-center justify-between border-b pb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-gray-600 text-sm">
                    ₱{item.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                <button
                  onClick={() =>
                    updateQuantity(item._id, Math.max(item.quantity - 1, 1))
                  }
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  −
                </button>
                <span className="font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="mt-8 border-t pt-4">
          <div className="mb-4">
            <h4 className="text-lg font-medium mb-2">Select Payment Method</h4>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio text-[#B84937]"
                />
                <span>Pay Online</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio text-[#B84937]"
                />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Transaction Fee (2%):</span>
              <span>₱{transactionFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Total:</h3>
                <h3 className="text-xl font-semibold">₱{totalAmount.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-3">
            <button
              onClick={clearCart}
              className="px-5 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition"
              disabled={loading}
            >
              Clear Cart
            </button>
            <button
              onClick={handleCheckout}
              className={`px-5 py-2 rounded-lg text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#B84937] hover:bg-[#9E3C2D]"
              }`}
              disabled={loading}
            >
              {loading ? "Processing..." : paymentMethod === 'cod' ? "Place Order" : "Proceed to Payment"}
            </button>
          </div>
        </div>
      </div>

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleAddressSave}
        loading={loading}
      />
    </div>
  );
}
