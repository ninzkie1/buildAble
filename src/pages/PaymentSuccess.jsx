import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import config from '../config/config';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [toastShown, setToastShown] = useState(false);

  const verifyPayment = useCallback(async () => {
    if (verified || !user?.token || toastShown) return;

    try {
      const orderId = searchParams.get('orderId');
      
      if (!orderId) {
        throw new Error('No order ID found');
      }

      const response = await fetch(
        `${config.apiUrl}/api/payments/verify/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setVerified(true);
      clearCart();
      localStorage.removeItem('pendingOrderId');
      
      if (!toastShown) {
        setToastShown(true);
        toast.success('Payment successful! Thank you for your purchase.', {
          id: 'payment-success', // Unique ID prevents duplicate toasts
        });
      }
      
      setTimeout(() => {
        navigate('/orders');
      }, 2000);

    } catch (error) {
      console.error('Payment verification error:', error);
      if (!toastShown) {
        setToastShown(true);
        toast.error(error.message, {
          id: 'payment-error', // Unique ID prevents duplicate toasts
        });
      }
      setTimeout(() => {
        navigate('/cart');
      }, 2000);
    } finally {
      setVerifying(false);
    }
  }, [user, navigate, clearCart, searchParams, verified, toastShown]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    verifyPayment();
  }, [user, verifyPayment]);

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
              Thank you for your purchase. Your order has been confirmed.
            </p>
            <p className="text-gray-500 text-sm">
              Redirecting to your orders...
            </p>
          </>
        )}
      </div>
    </div>
  );
}