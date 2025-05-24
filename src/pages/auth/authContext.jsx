import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const apiUrl = `${import.meta.env.VITE_API_URL}/users`; // Assurez-vous de définir l'URL correcte pour votre API

  // Vérifier si un token est présent dans le localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token"); // Récupérer le token du localStorage
    if (storedToken) {
      setToken(storedToken); // Mettre à jour le state du token
      getUserDetail(storedToken); // Appeler la fonction pour récupérer les détails de l'utilisateur
    } else {
      setLoading(false); // Pas de token, fin du chargement
    }
  }, []);

  // Fonction pour récupérer les détails de l'utilisateur
  const getUserDetail = async (token) => {
    try {
      const response = await axios.get(`${apiUrl}`, { // Endpoint pour récupérer les détails de l'utilisateur
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data); // Mettre à jour les détails de l'utilisateur
      setLoading(false); // Fin du chargement
    } catch (error) {
      console.error(error);
      setLoading(false); // Fin du chargement en cas d'erreur
    }
  };

  // Fonction pour se connecter
  const login = (userData, token) => {
    setUser(userData);
    setToken(token); // Mettre à jour le token dans le state
    localStorage.setItem("token", token); // Sauvegarder le token dans le localStorage
    // Navigation based on user role
    if (userData.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  };

  // Fonction pour se déconnecter
  const logout = () => {
    setUser(null);
    setToken(null); // Réinitialiser le token dans le state
    localStorage.removeItem("token"); // Supprimer le token du localStorage
    navigate("/"); // Rediriger vers la page de connexion
  };
  // Interceptor pour gérer l'expiration du token
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token"); // Supprimer le token expiré
        window.location.href = "/home"; // Rediriger vers la connexion
      }
      return Promise.reject(error);
    }
  );

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
