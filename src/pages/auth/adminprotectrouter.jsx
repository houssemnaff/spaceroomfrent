import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./authContext";

const AdminProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <p>Chargement...</p>;

  // Si pas connecté, permet l'accès à '/' mais redirige vers login pour '/admin'
  if (!user) return window.location.pathname === '/' ? <Outlet /> : <Navigate to="/login" replace />;
  
  // Si utilisateur normal, permet l'accès à '/' mais redirige vers '/home' pour '/admin'
  if (user.role !== 'admin') {
    return window.location.pathname === '/' || window.location.pathname.startsWith('/home') 
      ? <Outlet /> 
      : <Navigate to="/home" replace />;
  }
  
  // Si admin, permet l'accès à '/' et '/admin'
  return <Outlet />;
};

export default AdminProtectedRoute;