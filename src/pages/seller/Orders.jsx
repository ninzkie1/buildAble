import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Package, Truck, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/seller/orders?page=${currentPage}&limit=${ordersPerPage}`, 
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders);
        setTotalPages(Math.ceil(data.total / ordersPerPage));
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, [user, currentPage]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/seller/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await response.json();

      // Update local state with the returned order data
      setOrders(orders.map(order => 
        order._id === orderId ? { 
          ...order, 
          status: newStatus,
          updatedAt: new Date().toISOString() // Update the timestamp
        } : order
      ));

      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setLoading(true);
  };

  const renderPagination = () => {
    return (
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === page
                ? 'bg-[#B84937] text-white'
                : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const getPaymentStatusBadge = (paymentStatus, paymentMethod) => {
    // For COD orders
    if (paymentMethod === 'cod') {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
          COD
        </span>
      );
    }

    // For online payments
    if (paymentMethod === 'online') {
      const bgColor = paymentStatus === 'paid' ? 'bg-green-100' : 'bg-red-100';
      const textColor = paymentStatus === 'paid' ? 'text-green-700' : 'text-red-700';
      const status = paymentStatus === 'paid' ? 'PAID-ONLINE' : 'PENDING-ONLINE';
      return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
          {status}
        </span>
      );
    }

    // Default fallback
    return (
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
        {paymentMethod.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B84937]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Seller Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-medium">{order._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium">{order.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <p className="font-medium capitalize">{order.status}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment</p>
                <div className="mt-1">
                  {getPaymentStatusBadge(order.paymentStatus, order.paymentMethod)}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium capitalize">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </p>
                  {order.paymentMethod === 'online' && (
                    <p className="text-sm text-gray-600 mt-1">
                      Status: <span className="font-medium capitalize">
                        {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium">₱{order.totalAmount?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₱{item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium mb-2">Shipping Address:</p>
              <p className="text-gray-600">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>

            {/* Status Update */}
            <div className="mt-4 flex justify-between items-center">
              <select
                className="px-4 py-2 border rounded-lg"
                value={order.status}
                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>

              <div className="text-sm">
                <span className="text-gray-600">Last Updated: </span>
                <span className="font-medium">
                  {formatDateTime(order.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {renderPagination()}
    </div>
  );
}