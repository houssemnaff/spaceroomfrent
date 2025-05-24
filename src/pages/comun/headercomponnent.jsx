import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, Grid, Sun, Moon, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTheme } from "../../pages/admin/componnents/themcontext";
import { useAuth } from "../auth/authContext";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import NotificationsDropdown from "../../components/layouts/notification/notificationcomponnets";
import { useSidebar } from "../admin/componnents/sidebarcontext";

const Header = ({ 
  user,
  handleOpenProfile,
  notificationData
}) => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { toggleMobileSidebar, isMobileOpen } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const appMenuRef = useRef(null);
  const inputRef = useRef(null);
  
  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  // Handle profile click
  const handleProfileClick = () => {
    handleOpenProfile();
    setProfileOpen(false);
  };
  
  // Handle logout click
  const handleLogoutClick = () => {
    logout();
    setProfileOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (appMenuRef.current && !appMenuRef.current.contains(event.target)) {
        setApplicationMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
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

        {/* Application Menu */}
        <div className="relative" ref={appMenuRef}>
          <button
            onClick={toggleApplicationMenu}
            className={cn(
              "p-1 sm:p-2 rounded-full",
              theme === 'dark' ? "hover:bg-gray-800" : "hover:bg-gray-100"
            )}
            aria-label="Applications"
          >
            <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          {isApplicationMenuOpen && (
            <div className={cn(
              "absolute right-0 mt-2 w-48 sm:w-56 rounded-md shadow-lg z-50",
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            )}>
              <div className="py-1">
                <Link 
                  to="/home/agenda" 
                  className={cn(
                    "block px-4 py-2 text-xs sm:text-sm",
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  )}
                >
                  Agenda
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Notifications */}
        <NotificationsDropdown 
          notificationData={notificationData} 
          isDark={theme === 'dark'} 
          isMobile={window.innerWidth < 640} 
        />
        
        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <Button 
            variant="ghost" 
            className="p-1 flex items-center gap-1 sm:gap-2"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-haspopup="true"
            aria-expanded={profileOpen}
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
          
          {profileOpen && (
            <div 
              className={cn(
                "absolute right-0 mt-2 w-40 sm:w-48 py-1 rounded-md shadow-lg",
                theme === 'dark' 
                  ? 'bg-gray-800 text-white border border-gray-700' 
                  : 'bg-white border border-gray-200'
              )}
              role="menu"
              aria-orientation="vertical"
            >
              <button
                className={cn(
                  "block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm",
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                )}
                role="menuitem"
                onClick={handleProfileClick}
              >
                Profile
              </button>
              <div className={cn(
                "my-1 h-px",
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              )} />
              <button
                className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-500"
                role="menuitem"
                onClick={handleLogoutClick}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;