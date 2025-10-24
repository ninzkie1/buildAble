import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Calculate total amount
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Save current cart state
        localStorage.setItem("pendingCheckout", JSON.stringify(cart));

        // Redirect to login with return path
        navigate("/login", {
          state: {
            from: "/cart",
            message: "Please login to complete your purchase",
          },
        });
        return;
      }

      setLoading(true);
      setError("");

      // 
      //CHECKOUT AUTHENTICATED USER
      //
      const response = await fetch("http://localhost:5000/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout failed");
      }

      clearCart();
      toast.success("Order placed successfully! 🎉");
      navigate(`/orders/${data.orderId}`);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to process checkout");
      toast.error(err.message || "Failed to process checkout");
    } finally {
      setLoading(false);
    }
  };

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
                    ${item.price.toFixed(2)}
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
        <div className="mt-8 border-t pt-4 flex flex-col sm:flex-row justify-between items-center">
          <h3 className="text-xl font-semibold">
            Total: ${totalAmount.toFixed(2)}
          </h3>

          <div className="flex gap-3 mt-4 sm:mt-0">
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
              {loading ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
