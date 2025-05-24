import axios from "axios";
import { useState, useEffect } from "react";

export const useNotificationService = (token) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const apiUrl =`${import.meta.env.VITE_API_URL}/notifications`; // Update with your actual API endpoint

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setNotifications(response.data);
      const unread = response.data.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    if (!token || !notificationId) return;
    
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Update local state by removing the deleted notification
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Update unread count if necessary
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => prev - 1);
      }
      
      toast.success("Notification deleted successfully");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error(error.response?.data?.message || "Failed to delete notification");
    } finally {
      setLoading(false);
    }
  };

  // Mark specific notifications as read
  const markAsRead = async (notificationIds) => {
    if (!token || !notificationIds.length) return;
    
    try {
      await axios.patch(
        `${apiUrl}/read`,
        { notificationIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notificationIds.includes(notification._id)
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      const unread = notifications.filter(
        notification => !notification.read && !notificationIds.includes(notification._id)
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      await axios.patch(
        `${apiUrl}/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          read: true,
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Unknown time";
    
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    return type;
  };

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    formatRelativeTime,
    getNotificationIcon,
    deleteNotification,
  };
};