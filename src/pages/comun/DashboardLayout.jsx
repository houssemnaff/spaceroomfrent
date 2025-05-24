import React, { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/layouts/sidebar";
import { Outlet } from "react-router-dom";
import { CircleUser, HardDrive, LogOut, Bell, ClipboardList, FileText, Calendar, Camera, User, Mail, Save } from "lucide-react";
import { useAuth } from "../auth/authContext";
import { useNotification } from "../context/notificationcontext";
import { useTheme } from "../../pages/admin/componnents/themcontext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserById } from "@/services/userapi";
import Header from "./headercomponnent";
import { toast } from "react-toastify";

export const DashboardLayout = () => {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser, logout } = useAuth();
  const fileInputRef = useRef(null);
  
  // Use the theme context
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Use the notification context
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    fetchNotifications ,
    deleteNotification
  } = useNotification();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  
  // Local state for image preview
  const [imagePreview, setImagePreview] = useState(user?.imageurl || "");
  // Reference to store the actual file that will be uploaded
  const [imageFile, setImageFile] = useState(null);
  
  // Update profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
      });
      setImagePreview(user.imageurl || "");
    }
  }, [user]);

  const toggleConnection = () => {
    setIsConnected(!isConnected);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleOpenProfile = () => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
    });
    setImagePreview(user?.imageurl || "");
    setImageFile(null);
    setIsProfileOpen(true);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async () => {
    // Validate form
    if (!profileData.name.trim()) {
     
      toast.error("Name cannot be empty", {
        containerId: "devoirs-toast"

      });

      return;
    }

    setIsLoading(true);
    try {
      // Create a FormData object for file upload
      const formData = new FormData();
      
      // Add profile data to formData
      formData.append("name", profileData.name);
      
      // Don't send email if it hasn't changed
      if (profileData.email !== user?.email) {
        formData.append("email", profileData.email);
      }
      
      // Add image file if one was selected
      if (imageFile) {
        formData.append("file", imageFile);
      }
      
      // Log FormData entries for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'file' ? 'File object' : pair[1]));
      }

      // Call API to update user profile
      const updatedUser = await updateUserById(user._id, formData, token);
      
      // Update the user in auth context
        setUser(updatedUser);
      
      // Show success message
      toast.success("Your profile has been successfully updated", {
        containerId: "devoirs-toast"

      });
      
      // Close the profile sheet
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Show error message
      toast.error("Failed to update profile. Please try again.", {
        containerId: "devoirs-toast"

      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file", {
          containerId: "devoirs-toast"
  
        });
        return;
      }
      
      // Create a preview URL for UI display
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      
      // Store the actual file for later upload
      setImageFile(file);
    }
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Prepare notification data to pass to Header
  const notificationData = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    deleteNotification
  };

  // Get notification icon based on type - for mobile menu
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

  return (
    <div className={`${isDark ? 'dark bg-gray-900 text-white' : 'bg-white'} min-h-screen`}>
      {/* Use the extracted Header component */}
      <Header
        user={user}
        isConnected={isConnected}
        toggleConnection={toggleConnection}
        handleOpenProfile={handleOpenProfile}
        toggleMobileMenu={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
        notificationData={notificationData}
      />
      
      {/* Mobile menu - kept in DashboardLayout since it's specific to mobile layout */}
      {isMobileMenuOpen && (
        <div className={`fixed top-16 left-0 right-0 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg z-20 md:hidden`}>
          <div className={`p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b flex items-center gap-2 cursor-pointer`} onClick={handleOpenProfile}>
            {user?.imageurl ? (
              <img
                src={user.imageurl}
                alt={user.name}
                className={`h-8 w-8 rounded-full object-cover ${isDark ? 'border-gray-700' : 'border-gray-200'} border`}
              />
            ) : (
              <div className={`h-8 w-8 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                <CircleUser className={`h-6 w-6 ${isDark ? 'text-gray-300' : 'text-gray-500'}`} />
              </div>
            )}
            <span className={`text-sm font-medium ${isDark ? 'text-white' : ''}`}>{user?.name}</span>
          </div>
          
          <div className="p-4 flex items-center gap-2 cursor-pointer" onClick={toggleConnection}>
            <HardDrive className={`h-5 w-5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {isConnected ? 'Connected to Drive' : 'Not connected to Drive'}
            </span>
          </div>
          
          {/* Notifications in mobile menu */}
          <div className={`p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-t`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span className="text-sm font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all as read
                </Button>
              )}
            </div>
            
            <div className="mt-2 pl-7 space-y-3">
              {notifications.length === 0 ? (
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No notifications</div>
              ) : (
                notifications.slice(0, 3).map(notification => (
                  <div 
                    key={notification._id}
                    className={`text-sm ${!notification.read ? 'font-medium' : ''}`}
                    onClick={() => markAsRead([notification._id])}
                  >
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <span>{notification.title}</span>
                    </div>
                  </div>
                ))
              )}
              
              {notifications.length > 3 && (
                <div className="text-sm text-primary cursor-pointer">
                  See all notifications
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Modernized User Profile Sheet */}
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent className={`sm:max-w-md ${isDark ? 'bg-gray-900 text-white border-gray-800' : 'bg-gray-50'}`}>
          <SheetHeader>
            <SheetTitle className={`text-xl ${isDark ? 'text-white' : ''}`}>Profile Settings</SheetTitle>
          </SheetHeader>
          
          <div className="py-6">
            {/* Hero section with profile image */}
            <div className={`mb-6 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-28 w-28 border-4 border-primary/20">
                    <AvatarImage 
                      src={imagePreview || "https://github.com/shadcn.png"} 
                      alt={profileData.name}
                      className="object-cover"
                    />
                    <AvatarFallback className={`text-3xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      {profileData.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <label 
                    htmlFor="profile-image" 
                    className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer 
                      group-hover:bg-primary bg-primary/80 text-white
                      transition-all duration-200 hover:scale-110`}
                  >
                    <Camera className="h-5 w-5" />
                    <input 
                      ref={fileInputRef}
                      id="profile-image" 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <span className="sr-only">Upload profile photo</span>
                  </label>
                </div>
                
                <div className="text-center">
                  <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {profileData.name || "Your Name"}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {profileData.email || "your.email@example.com"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Form fields */}
            <div className={`space-y-5 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <h4 className={`font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Personal Information
              </h4>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label 
                    htmlFor="name" 
                    className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <User className="h-4 w-4" />
                    Display Name
                  </Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={profileData.name} 
                    onChange={handleProfileChange} 
                    placeholder="Your name"
                    className={`${isDark ? 'bg-gray-700 border-gray-600 text-white focus:ring-primary' : 'focus:ring-primary'}`}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label 
                    htmlFor="email" 
                    className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={profileData.email} 
                    onChange={handleProfileChange} 
                    placeholder="your.email@example.com"
                    disabled // Email usually shouldn't be changed easily
                    className={`${isDark ? 'bg-gray-700 border-gray-600 text-white opacity-60' : 'opacity-60'}`}
                  />
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Contact support to change your email address
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <SheetFooter className={`absolute bottom-0 left-0 right-0 p-6 ${isDark ? 'bg-gray-900 border-t border-gray-800' : 'bg-gray-50 border-t'}`}>
            <div className="flex w-full justify-between">
              <Button 
                variant={isDark ? "outline" : "outline"} 
                onClick={() => setIsProfileOpen(false)}
                className={isDark ? "border-gray-700 text-white hover:bg-gray-800" : ""}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={logout} 
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
                <Button 
                  onClick={handleProfileSubmit} 
                  disabled={isLoading}
                  className={`flex items-center gap-2 ${isDark ? 'bg-primary hover:bg-primary/90' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      <div className="flex flex-col h-screen pt-16">
        {/* Main content container with sidebar and content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar component - now positioned below the navbar */}
          <Sidebar className="h-full z-10" />
          
          {/* Main content area */}
          <div className="transition-all duration-300 flex-1 md:ml-16 lg:ml-64 overflow-y-auto">
            <div className={`p-4 md:p-6 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} min-h-full`}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;