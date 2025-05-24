import axios from "axios";

const apiUrl = `${import.meta.env.VITE_API_URL}/auth0`; // Assurez-vous de définir l'URL correcte pour votre API

export const loginApi = async (email, password) => {
  try {
    const response = await axios.post(`${apiUrl}/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const registerApi = async (name,email, password) => {
  try {
    const response = await axios.post(`${apiUrl}/register`, {name,email, password});
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
