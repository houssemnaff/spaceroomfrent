// Create this file at: src/pages/context/notificationcontext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../auth/authContext';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = `${import.meta.env.VITE_API_URL}/notification`;


  const fetchNotifications = async (limit = 10, skip = 0) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}?limit=${limit}&skip=${skip}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`${apiUrl}/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUnreadCount(response.data.unread);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const markAsRead = async (notificationIds) => {
    try {
      await axios.put(`${apiUrl}/read`, 
        { notificationIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notificationIds.includes(notif._id) ? { ...notif, read: true } : notif
        )
      );
      
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      setError(err.response?.data?.message || 'Error marking notifications as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${apiUrl}/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err.response?.data?.message || 'Error marking all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${apiUrl}/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      fetchUnreadCount();
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err.response?.data?.message || 'Error deleting notification');
    }
  };

  // Initialize notifications when authenticated
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up a polling interval for new notifications
      const intervalId = setInterval(fetchUnreadCount, 60000); // Every minute
      
      return () => clearInterval(intervalId);
    }
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;