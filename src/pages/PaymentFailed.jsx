import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import config from '../config/config';

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    let isSubscribed = true; 

    const deleteFailedOrder = async (orderId) => {
      try {
        console.log('Deleting order:', orderId);

        const response = await fetch(
          `${config.apiUrl}/api/orders/${orderId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        // Only proceed if component is still mounted
        if (!isSubscribed) return;

        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete order');
        }

        localStorage.removeItem('pendingOrderId');
        toast.error('Payment failed. Order has been cancelled.');
      } catch (error) {
        // Only show error if component is still mounted
        if (isSubscribed) {
          console.error('Error deleting failed order:', error);
          toast.error(error.message || 'Failed to delete order');
        }
      }
    };

    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      toast.error('Invalid order reference');
      navigate('/cart');
      return;
    }

    // Delete the failed order
    deleteFailedOrder(orderId);

    const timer = setTimeout(() => {
      if (isSubscribed) {
        setLoading(false);
        // Redirect to cart after 3 seconds
        setTimeout(() => {
          if (isSubscribed) {
            navigate('/cart');
          }
        }, 3000);
      }
    }, 1000);

    // Cleanup function
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [navigate, searchParams, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg text-center">
        {loading ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Processing...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <XCircle size={64} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment was not successful. The order has been cancelled.
            </p>
            <p className="text-gray-500 text-sm">
              Redirecting to cart...
            </p>
            <button
              onClick={() => navigate('/cart')}
              className="mt-6 w-full px-4 py-2 bg-[#B84937] text-white rounded-lg hover:bg-[#9E3C2D] transition"
            >
              Return to Cart
            </button>
          </>
        )}
      </div>
    </div>
  );
}