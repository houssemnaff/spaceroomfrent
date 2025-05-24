import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import { jwtDecode } from "jwt-decode";
import { refreshTokenApi, logoutApi } from "./authApi"; // Import from your API file

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();

  // Check for stored token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    
    if (storedToken) {
      setAccessToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    
    setLoading(false);
  }, []);

  // Fetch user data when access token changes
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!accessToken) return;

        // Check if token is expired
        try {
        //  const decoded = jwtDecode(accessToken);
          const isExpired = true;

          if (isExpired) {
            console.log("Access token expired, refreshing...");
            // Try to refresh the token
            const response = await refreshTokenApi();
            setAccessToken(response.accessToken);
            setUser(response.user);
            return;
          }
        } catch (decodeError) {
          console.error("Token decode error:", decodeError);
          // Invalid token, clear authentication
          logout();
          return;
        }

        // If token is valid, fetch user data
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth0/get-user`);
        setUser(response.data.user);
      } catch (error) {
        console.error("User fetch error:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Unauthorized, clear authentication
          logout();
        }
      }
    };

    fetchUser();
  }, [accessToken]);

  // Login function
  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    navigate("/home");
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state even if API call fails
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("accessToken");
      delete axios.defaults.headers.common["Authorization"];
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!accessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
