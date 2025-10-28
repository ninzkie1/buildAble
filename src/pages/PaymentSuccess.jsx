import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false); 

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderId = searchParams.get('orderId');
        
        if (!orderId) {
          throw new Error('No order ID found');
        }

        if (verified) return; // Prevent multiple verifications

        // Verify payment status
        const response = await fetch(
          `http://localhost:5000/api/payments/verify/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        const data = await response.json();
        
        if (data.success) {
          setVerified(true); // Mark as verified
          clearCart();
          localStorage.removeItem('pendingOrderId');
          
          // Show toast only once
          toast.success('Payment successful! Thank you for your purchase.', {
            id: 'payment-success', // Add unique ID
          });
          
          setTimeout(() => {
            navigate('/orders');
          }, 2000);
        } else {
          throw new Error(data.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error(error.message, {
          id: 'payment-error', // Add unique ID
        });
        setTimeout(() => {
          navigate('/cart');
        }, 2000);
      } finally {
        setVerifying(false);
      }
    };

    if (user && user.token && !verified) {
      verifyPayment();
    } else if (!user) {
      navigate('/login');
    }
  }, [user, navigate, clearCart, searchParams, verified]); // Add verified to dependencies

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg text-center">
        {verifying ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Verifying Payment...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your order has been confirmed and is being processed.
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Redirecting to your orders...
            </p>
          </>
        )}
      </div>
    </div>
  );
}