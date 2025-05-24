import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./authContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <p>Chargement...</p>;

  // Si pas connecté, permet l'accès à '/' mais redirige vers login pour les autres routes protégées
  if (!user) return window.location.pathname === '/' ? <Outlet /> : <Navigate to="/login" replace />;
  
  // Si admin, permet l'accès à '/' mais redirige vers '/admin' pour '/home'
  if (user.role === 'admin') {
    return window.location.pathname === '/' || window.location.pathname.startsWith('/admin') 
      ? <Outlet /> 
      : <Navigate to="/admin" replace />;
  }
  
  // Si utilisateur normal, permet l'accès à '/' et '/home'
  return <Outlet />;
};

export default ProtectedRoute;