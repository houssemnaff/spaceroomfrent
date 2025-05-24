import axios from "axios";

const apiUrl = "http://localhost:5000/auth0"; // Make sure this is the correct URL for your API

// Login API function
export const loginApi = async (user) => {
  try {
    // Get Firebase ID token
    const idToken = await user.getIdToken();
    
    // Send Firebase token to your backend
    const response = await axios.post(`${apiUrl}/authenticate`, { idToken });
    
    // Set default authorization header with the new backend token
    if (response.data.accessToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;
      
      // Store token in localStorage (or consider using HTTP-only cookies instead)
      localStorage.setItem("accessToken", response.data.accessToken);
    }
    
    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

// Register API function (now simplified since we're using Firebase authentication)
export const registerApi = async (user) => {
  // For Firebase authentication, registration and login can use the same endpoint
  // The backend will create a new user if they don't exist
  return loginApi(user);
};

// Refresh token function
export const refreshTokenApi = async () => {
  try {
    const response = await axios.post(`${apiUrl}/refresh-token`, {}, { 
      withCredentials: true // Important to include HTTP-only cookies
      
    });
    
    if (response.data.accessToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;
      localStorage.setItem("accessToken", response.data.accessToken);
    }
    
    return response.data;
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
};

// Logout function
export const logoutApi = async () => {
  try {
    await axios.post(`${apiUrl}/logout`, {}, { 
      withCredentials: true // Important to include HTTP-only cookies
    });
    
    // Clear local storage and authorization header
    localStorage.removeItem("accessToken");
    delete axios.defaults.headers.common["Authorization"];
    
    return { success: true };
  } catch (error) {
    console.error("Logout API error:", error);
    throw error;
  }
};