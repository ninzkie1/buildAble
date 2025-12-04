import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Bike, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';

const RiderNotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/api/rider/notifications`, {
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
      await fetch(`${config.apiUrl}/api/rider/notifications/${notificationId}/read`, {
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
      await fetch(`${config.apiUrl}/api/rider/notifications/read-all`, {
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

  // Fetch notifications on component mount and set up polling
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling to check for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Format notification message
  const formatMessage = (notification) => {
    if (notification.type === 'new_delivery') {
      const orderId = notification.data?.orderId 
        ? notification.data.orderId.toString().slice(-6) 
        : 'N/A';
      const amount = Number(notification.data?.totalAmount ?? 0).toFixed(2);
      return `New COD delivery - Order #${orderId} (₱${amount})`;
    }
    return notification.message;
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    if (type === 'new_delivery') {
      return <Bike className="text-blue-500" size={16} />;
    }
    return <Bell className="text-gray-500" size={16} />;
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
        <div
          className="fixed sm:absolute inset-x-4 sm:inset-x-auto top-20 sm:top-auto sm:right-0 mt-0 sm:mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-md bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200"
        >
          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-800">Delivery Notifications</h3>
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
                No new deliveries
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li 
                    key={notification._id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      markAsRead(notification._id);
                      // Navigate to rider dashboard when clicking on delivery notification
                      if (notification.type === 'new_delivery') {
                        navigate('/rider/dashboard');
                        setIsOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 font-medium">
                          {formatMessage(notification)}
                        </p>
                        {notification.data?.customerName && (
                          <p className="text-xs text-gray-600 mt-1">
                            Customer: {notification.data.customerName}
                          </p>
                        )}
                        {notification.data?.shippingAddress && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin size={12} />
                            {notification.data.shippingAddress.city}, {notification.data.shippingAddress.state}
                          </p>
                        )}
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

export default RiderNotificationDropdown;



