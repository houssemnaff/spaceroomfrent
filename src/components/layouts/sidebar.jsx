import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useTheme } from "../../pages/admin/componnents/themcontext";
import { cn } from "@/lib/utils";
import {
  Home,
  CalendarDays,
  BookOpen,
  ClipboardList,
  Archive,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/pages/auth/authContext";
import { useSidebar } from "@/pages/admin/componnents/sidebarcontext";
import {
  FaHome,
  FaCalendarAlt,
  FaBook,
  FaClipboardList,
  FaArchive,
  FaUsers,
  FaComments,
  FaCog,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaLifeRing,
  FaTools,
  FaUser,
  FaGraduationCap,
  FaChalkboardTeacher
} from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const { 
    isExpanded, 
    isMobileOpen, 
    toggleSidebar, 
    toggleMobileSidebar 
  } = useSidebar();

  useEffect(() => {
    // Close mobile sidebar on route change
    if (isMobileOpen) {
      toggleMobileSidebar();
    }
  }, [location.pathname]);

  const menuItems = [
    { icon: FaHome, text: "Accueil", path: "/home" },
    { icon: FaCalendarAlt, text: "Agenda", path: "/home/agenda" },
    { icon: FaChalkboardTeacher, text: "Cours Enseignés", path: "/home/coursinscrit" },
    { icon: FaGraduationCap, text: "Cours Suivis", path: "/home/courjoin" },
    { icon: FaUser, text: "Profil", path: "/home/profile" },
    { icon: FaTools, text: "Support", path: "/home/support" }
  ];


  // Classes conditionnelles pour le dark mode
  const sidebarClasses = cn(
    "fixed h-full shadow-lg z-40 transition-all duration-300 flex flex-col left-0 top-0",
    isExpanded ? "w-64" : "w-16",
    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
    theme === "dark" 
      ? "bg-gray-900 border-r border-gray-800 text-gray-200" 
      : "bg-white border-r border-gray-200 text-gray-800"
  );

  const menuItemClasses = (isActive) => cn(
    "w-full flex items-center justify-start gap-3 p-3 rounded-lg transition-all duration-200",
    isActive
      ? theme === "dark"
        ? "bg-blue-900 text-blue-200 font-semibold"
        : "bg-blue-100 text-blue-700 font-semibold"
      : theme === "dark"
        ? "hover:bg-gray-800 hover:text-white"
        : "hover:bg-gray-100"
  );

  const logoutButtonClasses = cn(
    "w-full flex items-center justify-start gap-3 p-3 transition-all duration-200",
    theme === "dark" 
      ? "text-red-400 hover:bg-gray-800" 
      : "text-red-600 hover:bg-gray-100"
  );

  return (
    <>
      {/* Overlay mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        {/* Header du Sidebar */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b",
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        )}>
          {isExpanded && <h1 className="text-xl font-bold">Dashboard</h1>}
          <button
            onClick={toggleSidebar}
            className={cn(
              "p-2 rounded-full",
              theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
            )}
            aria-label="Toggle sidebar"
          >
            {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          <ul className="px-2 py-4 space-y-1">
            {menuItems.map((item, index) => (
              <li key={index} className="flex items-center">
                <Button
                  variant="ghost"
                  className={menuItemClasses(location.pathname === item.path)}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  )} />
                  {isExpanded && (
                    <span className="truncate ml-2">{item.text}</span>
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/* Bouton de déconnexion */}
        <div className={cn(
          "mt-auto p-2 border-t",
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        )}>
          <Button
            onClick={logout}
            variant="ghost"
            className={logoutButtonClasses}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isExpanded && <span className="ml-2">Déconnexion</span>}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;