import React, { useState, useRef, useEffect } from "react";
import { Bell, ClipboardList, FileText, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const NotificationsDropdown = ({ notificationData, isDark, isMobile = false }) => {
  const { 
    notifications = [], 
    unreadCount = 0, 
    markAsRead, 
    markAllAsRead, 
    fetchNotifications,
    deleteNotification
  } = notificationData || {};

  // State to track swipe
  const [swipeState, setSwipeState] = useState({});
  const touchStartX = useRef({});
  const touchEndX = useRef({});
  const swipeThreshold = 80; // pixels to trigger delete option

  // Handle notification click - mark as read
  const handleNotificationClick = (notificationId) => {
    // Only process click if not swiping
    if (!swipeState[notificationId]) {
      markAsRead && markAsRead([notificationId]);
    }
  };

  // Handle notification delete
  const handleDeleteNotification = async (notificationId, e) => {
    if (e) e.stopPropagation(); // Prevent triggering the click event
    
    try {
      if (deleteNotification) {
        await deleteNotification(notificationId);
        // Reset swipe state for this notification
        setSwipeState(prev => ({
          ...prev,
          [notificationId]: false
        }));
        // Refresh notifications after delete
        fetchNotifications && fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Touch event handlers for swipe detection
  const handleTouchStart = (notificationId, e) => {
    touchStartX.current[notificationId] = e.touches[0].clientX;
  };

  const handleTouchMove = (notificationId, e) => {
    touchEndX.current[notificationId] = e.touches[0].clientX;
    const diffX = touchStartX.current[notificationId] - touchEndX.current[notificationId];
    
    // If swiping left more than threshold, show delete button
    if (diffX > swipeThreshold) {
      setSwipeState(prev => ({
        ...prev,
        [notificationId]: true
      }));
    } else {
      setSwipeState(prev => ({
        ...prev,
        [notificationId]: false
      }));
    }
  };

  const handleTouchEnd = (notificationId) => {
    // Reset touch positions
    touchStartX.current[notificationId] = 0;
    touchEndX.current[notificationId] = 0;
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <ClipboardList className="h-4 w-4 text-amber-500" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'resource':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
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

  // Reset all swipe states when dropdown closes
  const handleDropdownOpenChange = (open) => {
    if (!open) {
      setSwipeState({});
    }
    if (open && fetchNotifications) {
      fetchNotifications();
    }
  };

  return (
    <DropdownMenu onOpenChange={handleDropdownOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isDark ? "ghost" : "outline"}
          size="icon"
          className={`relative ${
            isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
          } ${unreadCount > 0 ? "animate-pulse" : ""}`}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className={`h-5 w-5 ${unreadCount > 0 ? "text-blue-500" : ""}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-800">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={`${isMobile ? 'w-72' : 'w-80'} ${isDark ? 'bg-gray-800 text-white border-gray-700' : ''}`}
      >
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className={isDark ? 'text-white' : ''}>Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsRead && markAllAsRead()}
              className={`text-xs ${isDark ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className={isDark ? 'bg-gray-700' : ''} />
        
        <div className={`${isMobile ? 'max-h-80' : 'max-h-96'} overflow-y-auto`}>
          {notifications.length === 0 ? (
            <div className={`py-4 px-2 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No notifications
            </div>
          ) : (
            notifications.map(notification => {
              const notificationId = notification._id || notification.id;
              const isSwipedLeft = swipeState[notificationId];
              
              return (
                <div 
                  key={notificationId}
                  className="relative overflow-hidden"
                  onTouchStart={isMobile ? (e) => handleTouchStart(notificationId, e) : null}
                  onTouchMove={isMobile ? (e) => handleTouchMove(notificationId, e) : null}
                  onTouchEnd={isMobile ? () => handleTouchEnd(notificationId) : null}
                >
                  {/* Delete action area that appears on swipe */}
                  {isMobile && (
                    <div 
                      className={`absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-500 transition-all duration-300 px-4 ${
                        isSwipedLeft ? 'translate-x-0' : 'translate-x-full'
                      }`}
                      onClick={() => handleDeleteNotification(notificationId)}
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <DropdownMenuItem 
                    className={`cursor-pointer py-2 transition-transform duration-300 ${
                      !notification.read 
                        ? isDark ? 'bg-blue-900/30' : 'bg-blue-50' 
                        : isDark ? '' : ''
                    } ${isSwipedLeft ? 'transform -translate-x-16' : ''}`}
                    onClick={() => handleNotificationClick(notificationId)}
                  >
                    <div className="flex flex-col space-y-1 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getNotificationIcon(notification.type)}
                          <span className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                            {notification.title}
                          </span>
                        </div>
                        {!isMobile && (
                          <button
                            onClick={(e) => handleDeleteNotification(notificationId, e)}
                            className={`text-gray-400 hover:text-red-500 transition-colors ${
                              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            } rounded-full p-1`}
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                  </DropdownMenuItem>
                </div>
              );
            })
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className={isDark ? 'bg-gray-700' : ''} />
            <div className="p-2 text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`w-full text-sm ${isDark ? 'hover:bg-gray-700' : ''}`}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;