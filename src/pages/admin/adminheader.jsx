import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, Grid, Sun, Moon, Menu, X, User as UserIcon, LogOut, Camera, Mail, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../auth/authContext";
import { useTheme } from "./componnents/themcontext";
import { useSidebar } from "./componnents/sidebarcontext";
import { updateUserById } from "@/services/userapi";
import { toast } from "react-toastify";
import { useNotification } from "../context/notificationcontext";
import NotificationsDropdown from "@/components/layouts/notification/notificationcomponnets";


const AppHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, setUser, logout, token } = useAuth();
  const { toggleMobileSidebar, isMobileOpen } = useSidebar();
  
  // Ajout du hook de notification
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    fetchNotifications,
    deleteNotification
  } = useNotification();
  
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  
  // Local state for image preview and file
  const [imagePreview, setImagePreview] = useState(user?.imageurl || "");
  const [imageFile, setImageFile] = useState(null);
  
  const appMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const isDark = theme === 'dark';
  
  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  // Prepare notification data to pass to NotificationsDropdown
  const notificationData = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    deleteNotification
  };

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
 
  // Handle profile click
  const handleOpenProfile = () => {
    // Reset profile data to current user data when opening
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
    });
    setImagePreview(user?.imageurl || "");
    setImageFile(null);
    setIsProfileOpen(true);
  };
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: "Please select an image file",
          variant: "destructive",
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

  // Handle profile form submission - IMPROVED VERSION
  const handleProfileSubmit = async () => {
    // Validate form
    if (!profileData.name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
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
      
      // Call API to update user profile
      const updatedUser = await updateUserById(user._id, formData, token);
      
      // Update the user in auth context
      setUser(updatedUser);
      
      // Show success message
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      // Close the profile sheet
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Show error message
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle logout click
  const handleLogoutClick = () => {
    logout();
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (appMenuRef.current && !appMenuRef.current.contains(event.target)) {
        setApplicationMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-2 sm:px-4 border-b",
        theme === 'dark' 
          ? 'bg-gray-900 border-gray-800 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      )}>
        <div className="flex items-center">
          <button
            onClick={toggleMobileSidebar}
            className="mr-2 sm:mr-4 p-1 sm:p-2 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle sidebar"
          >
            {isMobileOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
          <div className="flex items-center justify-center h-8 w-8">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/8438fdf3e8149084ed45099b71974cf199e146448a5b977414352412e96ce45b?placeholderIfAbsent=true"
              alt="Logo"
              className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
            />
          </div>
          <span className="text-base sm:text-lg font-bold text-black dark:text-white ml-1 sm:ml-2">
            <span className="hidden xs:inline">Spaceroom</span>
            <span className="xs:hidden">Spaceroom</span>
          </span>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="p-1 sm:p-2 rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            )}
          </Button>

          {/* Notifications - Remplace l'Application Menu */}
          <NotificationsDropdown
            notificationData={notificationData} 
            isDark={theme === 'dark'} 
            isMobile={window.innerWidth < 640} 
          />
          
          {/* User Profile Button */}
          <Button 
            variant="ghost" 
            className="p-1 flex items-center gap-1 sm:gap-2"
            onClick={handleOpenProfile}
            aria-haspopup="true"
          >
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-1 sm:ring-2 ring-primary/70">
              <AvatarImage src={user?.imageurl || "https://github.com/shadcn.png"} alt={user?.name || "User"} />
              <AvatarFallback className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} text-primary font-medium text-xs sm:text-sm`}>
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className={`font-medium text-xs sm:text-sm hidden md:block`}>
              {user?.name || "User"}
            </span>
          </Button>
        </div>
      </header>

      {/* Profile Sheet */}
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
                      src={imagePreview || user?.imageurl || "https://github.com/shadcn.png"} 
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
                    <UserIcon className="h-4 w-4" />
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
                    disabled
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
                  onClick={handleLogoutClick} 
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
    </>
  );
};

export default AppHeader;