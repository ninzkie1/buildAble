import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import config from '../../config/config';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        console.log('Fetching order details for ID:', id);

        if (!id || id === 'undefined') {
          throw new Error('Invalid order ID');
        }

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${config.apiUrl}/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch order details');
        }

        if (!data.success || !data.order) {
          throw new Error(data.message || 'Order data is missing from response');
        }

        // Additional validation of order structure
        const orderData = data.order;
        if (!orderData._id || !orderData.items || !Array.isArray(orderData.items)) {
          throw new Error('Invalid order data structure');
        }

        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  const getOptimizedImageUrl = (imageUrl, width = 400) => {
    if (!imageUrl) return "/placeholder.jpg";
    if (imageUrl.includes("res.cloudinary.com")) {
      const parts = imageUrl.split("/upload/");
      return `${parts[0]}/upload/w_${width},c_fill,q_auto,f_auto/${parts[1]}`;
    }
    return imageUrl;
  };

  // Show more detailed loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Show more informative error state
  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex flex-col gap-2">
            <p className="text-red-700 font-medium">Error loading order</p>
            <p className="text-red-600">{error || 'Order could not be found'}</p>
            <Link 
              to="/orders" 
              className="text-red-600 hover:underline mt-2 inline-flex items-center gap-2"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Order Details</h2>
        <Link to="/orders" className="text-orange-600 hover:underline">
          ← Back to Orders
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-lg">Order #{order._id.slice(-6)}</p>
              <p className="text-sm text-gray-500">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-lg">
                Total: ₱{order.totalAmount.toFixed(2)}
              </p>
              <p className={`text-sm ${
                order.status === 'completed' ? 'text-green-600' :
                order.status === 'cancelled' ? 'text-red-600' :
                'text-orange-600'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-medium mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={getOptimizedImageUrl(item.product.imageUrl)}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity} × ₱{item.product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="font-medium">
                  ₱{(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}