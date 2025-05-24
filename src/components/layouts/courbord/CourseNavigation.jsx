import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useTheme } from "../../../pages/admin/componnents/themcontext";
import { 
  BookOpen, 
  MessageSquare, 
  Users, 
  FileText, 
  BarChart2, 
  Video,
  Award,
  ClipboardList,
  Calendar,
  Bookmark,
  GraduationCap,
  FileCheck
} from "lucide-react";

export const CourseNavigation = () => {
  const location = useLocation();
  const activeTab = location.pathname.split("/").pop() || "cours";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Navigation items with improved icons and colors
  const navItems = [
    { 
      path: "cours", 
      label: "Cours", 
      icon: <BookOpen className="h-5 w-5" />, 
      activeColor: "text-blue-500",
      inactiveColor: "text-blue-400"
    },
    { 
      path: "note", 
      label: "Notes", 
      icon: <Award className="h-5 w-5" />, 
      activeColor: "text-purple-500",
      inactiveColor: "text-purple-400"
    },
    { 
      path: "discussion", 
      label: "Discussion", 
      icon: <MessageSquare className="h-5 w-5" />, 
      activeColor: "text-green-500",
      inactiveColor: "text-green-400"
    },
    { 
      path: "student", 
      label: "Étudiants", 
      icon: <GraduationCap className="h-5 w-5" />, 
      activeColor: "text-black",        // Noir quand actif
      inactiveColor: "text-gray-600" // Gris foncé quand inactif
                 
    },
    { 
      path: "devoirs", 
      label: "Devoirs", 
      icon: <FileCheck className="h-5 w-5" />, 
      activeColor: "text-red-500",
      inactiveColor: "text-red-400"
    },
    { 
      path: "meeting", 
      label: "Réunions", 
      icon: <Calendar className="h-5 w-5" />, 
      activeColor: "text-teal-500",
      inactiveColor: "text-teal-400"
    }
  ];

  const currentCourseId = location.pathname.split("/")[3];
  const basePath = `/home/course/${currentCourseId}`;
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`shadow-md rounded-lg m-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Mobile menu button */}
      <div className="md:hidden flex justify-between items-center p-4">
        <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>Menu du cours</span>
        <button 
          onClick={toggleMenu} 
          className={`p-2 rounded-md transition-colors duration-200 ${
            isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
          } focus:outline-none`}
        >
          {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Navigation items */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:flex md:flex-row flex-col p-2 md:p-4`}>
        {navItems.map((item, index) => {
          const isActive = activeTab === item.path;
          const iconColor = isActive ? item.activeColor : item.inactiveColor;
          
          return (
            <Link 
              key={index} 
              to={`${basePath}/${item.path}`}
              className={`flex-1 transition-all duration-200 ${index > 0 ? 'md:ml-2' : ''} ${
                index < navItems.length - 1 ? 'mb-2 md:mb-0' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div 
                className={`flex items-center px-4 py-3 rounded-lg ${
                  isActive 
                    ? `${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${item.activeColor} font-medium`
                    : `${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`
                } transition-all duration-200`}
              >
                <span className={`mr-3 ${iconColor}`}>
                  {item.icon}
                </span>
                <span className={`${isActive ? item.activeColor : isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className={`ml-auto h-2 w-2 rounded-full ${item.activeColor.replace('text-', 'bg-')}`}></span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default CourseNavigation;