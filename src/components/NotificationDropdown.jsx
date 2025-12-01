import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, ShoppingCart, CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import config from '../config/config';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/api/seller/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${config.apiUrl}/api/seller/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update local state
      setNotifications(notifications.map(notif => 
        notif._id === notificationId ? { ...notif, read: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${config.apiUrl}/api/seller/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling to check for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <ShoppingCart className="text-blue-500" size={16} />;
      case 'withdrawal_approved':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'withdrawal_completed':
        return <CheckCircle className="text-emerald-500" size={16} />;
      case 'withdrawal_rejected':
        return <AlertCircle className="text-red-500" size={16} />;
      case 'withdrawal_pending':
        return <Clock className="text-yellow-500" size={16} />;
      default:
        return <Bell className="text-gray-500" size={16} />;
    }
  };

  // Format notification message
  const formatMessage = (notification) => {
    const amount = Number(notification.data?.amount ?? 0).toFixed(2);
    switch (notification.type) {
      case 'new_order':
        return `New order #${notification.data.orderId} received`;
      case 'withdrawal_approved':
        return `Withdrawal of ₱${amount} has been approved`;
      case 'withdrawal_completed':
        return `Withdrawal of ₱${amount} has been paid`;
      case 'withdrawal_rejected':
        return `Withdrawal of ₱${amount} was rejected`;
      case 'withdrawal_pending':
        return `Withdrawal of ₱${amount} is pending review`;
      default:
        return notification.message;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            markAllAsRead();
          }
        }}
        className="p-2 rounded-full hover:bg-white/10 relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li 
                    key={notification._id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      markAsRead(notification._id);
                      // Handle navigation based on notification type
                      if (notification.type === 'new_order') {
                        // Navigate to seller orders list; the seller can see the new order there
                        window.location.href = '/seller/orders';
                      } else if (notification.type.startsWith('withdrawal_')) {
                        // Jump to withdrawals section on the dashboard
                        window.location.href = '/sellerHome#withdrawals';
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{formatMessage(notification)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
              <button
                onClick={() => {
                  markAllAsRead();
                  setIsOpen(false);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
