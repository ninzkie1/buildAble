import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Package, Truck, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import config from '../../config/config';

export default function TrackOrder() {
  const { orderId } = useParams();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `${config.apiUrl}/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Order not found');
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log

        if (data.success && data.order) {
          console.log('Shipping Address in Response:', data.order.shippingAddress); // Debug log
          setOrder(data.order);
        } else {
          throw new Error('Invalid order data');
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && orderId) {
      fetchOrder();
    }
  }, [orderId, user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'processing':
        return <Package className="w-8 h-8 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-8 h-8 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'COD':
        return <AlertCircle className="w-8 h-8 text-orange-500" />;
      default:
        return <Clock className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusClass = (orderStatus, status) => {
    const baseClass = "flex flex-col items-center";
    const states = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = states.indexOf(orderStatus);
    const statusIndex = states.indexOf(status);

    if (orderStatus === 'cancelled') {
      return `${baseClass} ${status === 'cancelled' ? 'text-red-500' : 'text-gray-300'}`;
    }

    if (orderStatus === 'COD') {
      return `${baseClass} ${status === 'COD' ? 'text-orange-500' : 'text-gray-300'}`;
    }

    if (statusIndex <= currentIndex) {
      return `${baseClass} text-[#B84937]`;
    }

    return `${baseClass} text-gray-300`;
  };

  const renderOrderItems = () => {
    if (!order?.items || order.items.length === 0) {
      return <p className="text-gray-600">No items available</p>;
    }

    return (
      <div className="space-y-4">
        {order.items.map((item) => {
          console.log('Item details:', item); // Debug log
          return (
            <div key={item._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">₱{item.product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">
                  Total: ₱{(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderShippingAddress = () => {
    // Access shippingAddress directly from order
    if (!order || !order.shippingAddress) {
      return <p className="text-gray-600">No shipping address available</p>;
    }

    const { street, city, state, postalCode, country } = order.shippingAddress;

    // Add debug logging
    console.log('Shipping Address Data:', {
      street, city, state, postalCode, country
    });

    // Check if any required field is missing
    if (!street || !city || !state || !postalCode || !country) {
      return <p className="text-gray-600">Incomplete shipping address</p>;
    }

    return (
     <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-5">
    <h3 className="text-gray-800 font-semibold text-lg mb-3">Shipping Address</h3>
    <div className="space-y-1 text-gray-700 leading-relaxed">
        <p><span className="font-medium text-gray-600">Street:</span> {street}</p>
        <p><span className="font-medium text-gray-600">City:</span> {city}</p>
        <p><span className="font-medium text-gray-600">State:</span> {state}</p>
        <p><span className="font-medium text-gray-600">Postal Code:</span> {postalCode}</p>
        <p><span className="font-medium text-gray-600">Country:</span> {country}</p>
    </div>
    </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B84937]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Order Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Track Order</h1>
        
        {/* Order Details */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-medium">{order?._id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="font-medium">
              {order?.createdAt && new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="relative">
          <div className="flex justify-between mb-8">
            <div className={getStatusClass(order.status, 'pending')}>
              {getStatusIcon('pending')}
              <p className="mt-2">Pending</p>
            </div>
            <div className={getStatusClass(order.status, 'processing')}>
              {getStatusIcon('processing')}
              <p className="mt-2">Processing</p>
            </div>
            <div className={getStatusClass(order.status, 'shipped')}>
              {getStatusIcon('shipped')}
              <p className="mt-2">Shipped</p>
            </div>
            <div className={getStatusClass(order.status, 'delivered')}>
              {getStatusIcon('delivered')}
              <p className="mt-2">Delivered</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-[#B84937]" 
              style={{ 
                width: order.status === 'delivered' ? '100%' : 
                       order.status === 'shipped' ? '66%' :
                       order.status === 'processing' ? '33%' :
                       order.status === 'pending' ? '0%' : '0%'
              }}
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
          {renderShippingAddress()}
        </div>

        {/* Order Items */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          {renderOrderItems()}
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="font-semibold">Total Amount</p>
              <p className="font-semibold text-lg">
                ₱{order?.totalAmount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}