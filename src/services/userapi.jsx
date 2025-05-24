import axios from "axios";

// Base URL for user-related API requests
//const apiUrl = "http://localhost:5000/users";
const apiUrl = `${import.meta.env.VITE_API_URL}/users`;
export const fetchUserById = async (id, token) => {
 // console.log("iddd de user ",id);
    try {
      const response = await axios.get(`${apiUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error.response?.data || error.message);
      throw error;
    }
  };
  

// Fonction pour supprimer un utilisateur par son ID
export const deleteUserById = async (id, token) => {
  try {
    const response = await axios.delete(`${apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);
    throw error;
  }
};
// In userapi.js
export const updateUserById = async (id, updatedData, token) => {
  try {
    // Ensure we're sending FormData to the backend
    // No need to convert to FormData if it's already FormData
    const dataToSend = updatedData instanceof FormData 
      ? updatedData 
      : new FormData();
    
    // If updatedData is not FormData, add each property to FormData
    if (!(updatedData instanceof FormData)) {
      Object.keys(updatedData).forEach(key => {
        dataToSend.append(key, updatedData[key]);
      });
    }
    
    const response = await axios.put(`${apiUrl}/${id}`, dataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type here - axios will set it correctly for FormData
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
