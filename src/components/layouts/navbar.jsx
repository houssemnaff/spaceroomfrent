import React from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaEnvelope,
  FaBars,
  FaUserCircle,
  FaSignOutAlt,
  FaSignInAlt
} from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/pages/auth/authContext";

const App = () => {
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;

  return (
    <header className="relative bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 border-b border-blue-400/20 w-full px-6 md:px-16 lg:px-24 sticky top-0 z-50 backdrop-blur-md">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-16 h-16 bg-blue-400/10 rounded-full animate-pulse"></div>
        <div className="absolute top-0 right-1/3 w-12 h-12 bg-cyan-400/15 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-0 left-3/4 w-8 h-8 bg-indigo-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
      </div>

      <nav className="relative z-10 flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
  <div className="flex items-center gap-2">
    <img
      src="https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/8438fdf3e8149084ed45099b71974cf199e146448a5b977414352412e96ce45b?placeholderIfAbsent=true"
      alt="Spaceroom Logo"
      className="h-8 w-8 object-contain"
    />
    <span className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-white transition-all duration-300">
      Spaceroom
    </span>
  </div>
</Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks />
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to="/home"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-800/30 hover:bg-blue-700/40 backdrop-blur-sm border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 group"
              >
                <FaUserCircle className="text-cyan-400 text-xl group-hover:text-cyan-300 transition-colors" />
                <span className="text-white font-medium">Mon Espace</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-300 hover:bg-blue-800/30 hover:text-cyan-400 rounded-full border border-transparent hover:border-blue-400/30 backdrop-blur-sm transition-all duration-300"
                onClick={logout}
                aria-label="Déconnexion"
              >
                <FaSignOutAlt className="text-xl" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button className="relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-blue-400/20">
                <span className="relative z-10 flex items-center gap-2">
                  <FaSignInAlt />
                  Connexion
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
              </Button>
            </Link>
          )}
        </div>

        {/* Menu Mobile avec Sheet */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-300 hover:bg-blue-800/30 hover:text-cyan-400 rounded-full border border-transparent hover:border-blue-400/30 backdrop-blur-sm transition-all duration-300"
              >
                <FaBars className="text-xl" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[300px] flex flex-col gap-6 p-6 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 border-r border-blue-400/20">
              {/* Mobile menu background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-indigo-800/50 to-purple-900/50 backdrop-blur-xl"></div>

              <div className="relative z-10 flex items-center gap-3 mb-6 p-3 rounded-xl bg-blue-800/20 backdrop-blur-sm border border-blue-400/20">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-30 animate-pulse"></div>
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/8438fdf3e8149084ed45099b71974cf199e146448a5b977414352412e96ce45b?placeholderIfAbsent=true"
                    alt="Spaceroom Logo"
                    className="relative h-8 w-8 object-contain"
                  />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">Spaceroom</span>
              </div>

              <div className="relative z-10 flex flex-col gap-2">
                <NavLinksMobile />
              </div>

              <div className="relative z-10 mt-auto pt-6 border-t border-blue-400/20">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/home"
                      className="flex items-center gap-3 p-4 rounded-xl bg-blue-800/20 hover:bg-blue-700/30 backdrop-blur-sm border border-blue-400/20 hover:border-blue-400/40 text-white font-medium transition-all duration-300 group"
                    >
                      <FaUserCircle className="text-cyan-400 text-lg group-hover:text-cyan-300" />
                      <span>Mon Espace</span>
                    </Link>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 justify-start p-4 rounded-xl text-blue-200 hover:bg-blue-800/20 hover:text-cyan-400 backdrop-blur-sm border border-transparent hover:border-blue-400/30 transition-all duration-300"
                      onClick={logout}
                    >
                      <FaSignOutAlt className="text-blue-300 text-lg" />
                      <span>Déconnexion</span>
                    </Button>
                  </div>
                ) : (
                  <Link to="/login">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                      <FaSignInAlt className="mr-2" />
                      Connexion
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

// Composant pour les liens du menu desktop
const NavLinks = () => (
  <div className="flex items-center gap-8">
    <NavLinkItem to="/" icon={<FaHome />} text="Accueil" />
    <NavLinkItem to="/contact" icon={<FaEnvelope />} text="Contact" />
  </div>
);

// Composant pour les liens du menu mobile
const NavLinksMobile = () => (
  <>
    <MobileNavLink to="/" icon={<FaHome />} text="Accueil" />
    <MobileNavLink to="/contact" icon={<FaEnvelope />} text="Contact" />
  </>
);

// Composant pour un lien de navigation desktop
const NavLinkItem = ({ to, icon, text }) => (
  <Link
    to={to}
    className="flex items-center gap-2 px-4 py-2 rounded-full group text-blue-100 hover:text-white transition-all duration-300 hover:bg-blue-800/20 backdrop-blur-sm border border-transparent hover:border-blue-400/30"
  >
    <span className="text-cyan-400 group-hover:text-cyan-300 text-lg transition-colors">
      {icon}
    </span>
    <span className="font-medium">{text}</span>
  </Link>
);

// Composant pour un lien de navigation mobile
const MobileNavLink = ({ to, icon, text }) => (
  <Link
    to={to}
    className="flex items-center gap-3 p-4 rounded-xl hover:bg-blue-800/20 text-blue-100 hover:text-white font-medium backdrop-blur-sm border border-transparent hover:border-blue-400/30 transition-all duration-300 group"
  >
    <span className="text-cyan-400 group-hover:text-cyan-300 text-lg transition-colors">
      {icon}
    </span>
    <span>{text}</span>
  </Link>
);

export default App;