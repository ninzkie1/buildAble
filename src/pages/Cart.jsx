import React, { useState, useContext, useEffect, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { Trash2, Store } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AddressModal from "../components/AddressModal";
import PaymentMethodModal from "../components/PaymentMethodModal";
import config from "../config/config";

export default function Cart() {
  const { cart, removeFromCart, removeMultipleFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [sellerInfo, setSellerInfo] = useState({});
  const [pendingCheckoutItems, setPendingCheckoutItems] = useState(null); // Items to checkout after address is saved
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState(null); // Payment method selected in modal
  const navigate = useNavigate();

  // Group cart items by seller
  const itemsBySeller = useMemo(() => {
    const grouped = {};
    cart.forEach((item) => {
      // Get seller ID - handle both populated and non-populated seller
      const sellerId = item.seller?._id || item.seller || 'unknown';
      const sellerName = item.seller?.name || sellerInfo[sellerId]?.name || `Seller ${sellerId.slice(-6)}`;
      
      if (!grouped[sellerId]) {
        grouped[sellerId] = {
          sellerId,
          sellerName,
          items: [],
          subtotal: 0,
        };
      }
      
      grouped[sellerId].items.push(item);
      grouped[sellerId].subtotal += item.price * item.quantity;
    });
    return grouped;
  }, [cart, sellerInfo]);

  // Calculate subtotal (items total)
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculate 2% transaction fee
  const transactionFee = subtotal * 0.02;

  // Calculate final total (subtotal + transaction fee)
  const totalAmount = subtotal + transactionFee;

  // Fetch seller information for items that don't have it populated
  useEffect(() => {
    const fetchSellerInfo = async () => {
      const itemsNeedingSellerInfo = cart.filter(
        (item) => {
          const sellerId = item.seller?._id || item.seller;
          return sellerId && typeof sellerId === 'string' && !item.seller?.name;
        }
      );

      if (itemsNeedingSellerInfo.length === 0) return;

      try {
        // Fetch product details which include populated seller info
        const productPromises = itemsNeedingSellerInfo.map(async (item) => {
          try {
            const response = await fetch(`${config.apiUrl}/api/products/${item._id}`);
            if (response.ok) {
              const data = await response.json();
              const sellerId = item.seller?._id || item.seller;
              const sellerName = data.product?.seller?.name;
              if (sellerName && sellerId) {
                return { sellerId, name: sellerName };
              }
            }
          } catch (err) {
            console.error(`Failed to fetch product ${item._id}:`, err);
          }
          const sellerId = item.seller?._id || item.seller;
          return { sellerId, name: `Seller ${sellerId?.slice(-6) || 'Unknown'}` };
        });

        const sellers = await Promise.all(productPromises);
        const sellerMap = {};
        sellers.forEach(({ sellerId, name }) => {
          if (sellerId) {
            sellerMap[sellerId] = { name };
          }
        });
        setSellerInfo((prev) => ({ ...prev, ...sellerMap }));
      } catch (error) {
        console.error("Error fetching seller info:", error);
      }
    };

    if (cart.length > 0) {
      fetchSellerInfo();
    }
  }, [cart]);

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
      // Show payment method modal after address is saved
      if (pendingCheckoutItems && pendingCheckoutItems.length > 0) {
        setShowPaymentModal(true);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (sellerItems = null) => {
    if (!user || !user.token) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }

    // If sellerItems is provided, checkout only those items, otherwise checkout all
    const itemsToCheckout = Array.isArray(sellerItems) ? sellerItems : (Array.isArray(cart) ? cart : []);
    
    if (itemsToCheckout.length === 0) {
      toast.error("No items to checkout");
      return;
    }

    // Check if user has address
    if (!userAddress || !userAddress.street || !userAddress.city) {
      toast('Please add your delivery address', {
        icon: '📍',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      // Store items to checkout after address is saved
      setPendingCheckoutItems(itemsToCheckout);
      setShowAddressModal(true);
      return;
    }

    // Show payment method modal
    setPendingCheckoutItems(itemsToCheckout);
    setShowPaymentModal(true);
  };

  const handlePaymentMethodConfirm = (selectedMethod) => {
    setPaymentMethod(selectedMethod);
    setPendingPaymentMethod(selectedMethod);
    setShowPaymentModal(false);
    
    // Get the items to checkout (from pending or use current cart)
    const itemsToCheckout = pendingCheckoutItems || cart;
    
    // Proceed with checkout using the selected payment method
    if (itemsToCheckout && itemsToCheckout.length > 0) {
      processCheckout(userAddress, itemsToCheckout, selectedMethod);
    }
  };

  const processCheckout = async (address, itemsToCheckout, selectedPaymentMethod = null) => {
    const methodToUse = selectedPaymentMethod || paymentMethod;
    try {
      setLoading(true);
      setError("");

      // Validate itemsToCheckout is an array
      if (!Array.isArray(itemsToCheckout) || itemsToCheckout.length === 0) {
        toast.error("No items to checkout");
        setLoading(false);
        return;
      }

      // Ensure address is complete
      if (!address || !address.street || !address.city || !address.state || !address.postalCode || !address.country) {
        toast.error("Please provide complete shipping address");
        setShowAddressModal(true);
        setLoading(false);
        return;
      }

      // Calculate totals for the items being checked out
      const checkoutSubtotal = itemsToCheckout.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      );
      const checkoutTransactionFee = checkoutSubtotal * 0.02;
      const checkoutTotal = checkoutSubtotal + checkoutTransactionFee;

      const orderResponse = await fetch(
        `${config.apiUrl}/api/orders/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            items: itemsToCheckout.map((item) => ({
              product: item._id,
              quantity: item.quantity,
              price: item.price,
            })),
            address: {
              street: address.street,
              region: address.region,
              province: address.province,
              city: address.city,
              barangay: address.barangay,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country
            },
            paymentMethod: methodToUse
            // Removed status and paymentStatus override since they will be handled by backend
          }),
        }
      );

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Failed to create order");
      }

      // Support both single-seller and multi-seller order responses
      const anchorOrderId = orderData.anchorOrderId || orderData.order?._id || orderData.orders?.[0]?._id;

      if (methodToUse === 'cod') {
        // Handle COD order (one or multiple per-seller orders)
        // Remove only the checked out items from cart
        const checkedOutProductIds = itemsToCheckout.map(item => item._id);
        console.log('Checkout COD - Items to remove:', checkedOutProductIds);
        console.log('Checkout COD - Current cart:', cart.map(item => item._id));
        
        // Use removeMultipleFromCart to remove all items at once
        // This avoids race conditions from multiple sequential removals
        await removeMultipleFromCart(checkedOutProductIds);
        
        toast.success('Order placed successfully! (Cash on Delivery)');
        // Small delay to ensure cart is updated before navigation
        setTimeout(() => {
          navigate('/orders');
        }, 800);
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
            orderId: anchorOrderId,
            amount: checkoutTotal,
            email: user.email,
            successUrl: `${window.location.origin}/payment-success?orderId=${orderData.order?._id || anchorOrderId}`,
            cancelUrl: `${window.location.origin}/payment-failed?orderId=${orderData.order?._id || anchorOrderId}`,
          }),
        }
      );

      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || "Payment initialization failed");
      }

      localStorage.setItem("pendingOrderId", anchorOrderId);
      // Store checked out product IDs so PaymentSuccess can remove them if needed
      localStorage.setItem("checkedOutProductIds", JSON.stringify(itemsToCheckout.map(item => item._id)));

      if (paymentData.checkoutUrl) {
        // Remove checked out items from cart before redirecting
        const checkedOutProductIds = itemsToCheckout.map(item => item._id);
        
        // Use removeMultipleFromCart to remove all items at once
        // This avoids race conditions from multiple sequential removals
        await removeMultipleFromCart(checkedOutProductIds);
        
        // Small delay to ensure cart is updated before redirect
        setTimeout(() => {
          window.location.href = paymentData.checkoutUrl;
        }, 300);
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

        {/* Group items by seller */}
        <div className="space-y-6">
          {Object.values(itemsBySeller).map((sellerGroup) => (
            <div key={sellerGroup.sellerId} className="border rounded-lg p-4 bg-gray-50">
              {/* Seller Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <Store size={20} className="text-[#B84937]" />
                <h3 className="font-semibold text-gray-800">
                  {sellerGroup.sellerName}
                </h3>
                <span className="text-sm text-gray-500">
                  ({sellerGroup.items.length} {sellerGroup.items.length === 1 ? 'item' : 'items'})
                </span>
              </div>

              {/* Items for this seller */}
              <div className="space-y-4">
                {sellerGroup.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row items-center justify-between bg-white p-3 rounded border"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-gray-600 text-sm">
                          ₱{item.price.toFixed(2)} × {item.quantity} = ₱{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 sm:mt-0">
                      <button
                        onClick={() =>
                          updateQuantity(item._id, Math.max(item.quantity - 1, 1), item.stock || 999)
                        }
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        −
                      </button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1, item.stock || 999)}
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

              {/* Seller subtotal and checkout */}
              <div className="mt-4 pt-3 border-t flex flex-col sm:flex-row justify-between items-end gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Subtotal for this seller:</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₱{sellerGroup.subtotal.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleCheckout(sellerGroup.items)}
                  className={`px-5 py-2 rounded-lg text-white transition ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#B84937] hover:bg-[#9E3C2D]"
                  }`}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Checkout"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="mt-8 border-t pt-4">
          {/* Price Breakdown */}
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({Object.keys(itemsBySeller).length} {Object.keys(itemsBySeller).length === 1 ? 'seller' : 'sellers'}):</span>
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

          {/* Info message about separate orders */}
          {Object.keys(itemsBySeller).length > 1 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Items from different sellers will be processed as separate orders. 
                Each seller will be able to update their own order status independently.
              </p>
            </div>
          )}

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
              {loading ? "Processing..." : "Checkout All"}
            </button>
          </div>
        </div>
      </div>

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setPendingCheckoutItems(null);
        }}
        onSave={handleAddressSave}
        loading={loading}
      />

      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPendingCheckoutItems(null);
        }}
        onConfirm={handlePaymentMethodConfirm}
        subtotal={pendingCheckoutItems 
          ? pendingCheckoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
          : subtotal
        }
        transactionFee={pendingCheckoutItems 
          ? pendingCheckoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.02
          : transactionFee
        }
        totalAmount={pendingCheckoutItems 
          ? (pendingCheckoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.02)
          : totalAmount
        }
        loading={loading}
      />
    </div>
  );
}
