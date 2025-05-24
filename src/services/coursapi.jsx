// src/services/courseApi.js
import axios from "axios";

// Base URL for course-related API requests
const apiUrl = `${import.meta.env.VITE_API_URL}/course`;


export const createCourse = async (courseData, token) => {
  try {
    // Créer un nouvel objet FormData
    const formData = new FormData();
    
    // Ajouter les champs texte
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    
    // Ajouter le fichier s'il existe
    if (courseData.imageFile) {
      formData.append('file', courseData.imageFile);
    }

    // Envoyer la requête avec les headers appropriés
    const response = await axios.post(`${apiUrl}/create`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 201) {
      return response.data;
    }
    throw new Error('La création du cours a échoué');
    
  } catch (error) {
    // Gestion améliorée des erreurs
    let errorMessage = 'Erreur lors de la création du cours';
    
    if (error.response) {
      // Erreur retournée par le serveur
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      errorMessage = 'Pas de réponse du serveur';
    }
    
    throw new Error(errorMessage);
  }
};
// Fetch user's own courses
export const fetchMyCourses = async (token) => {
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const response = await axios.get(`${apiUrl}/my-courses`, { headers });
    return response.data.courses || [];
  } catch (error) {
    throw new Error("Error fetching my courses: " + error.message);
  }
};



// Fetch courses the user has joined
export const fetchJoinedCourses = async (token) => {
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const response = await axios.get(`${apiUrl}/my-join-courses`, { headers });
    return response.data.joinedCourses || [];
  } catch (error) {
    throw new Error("Error fetching joined courses: " + error.message);
  }
};


// Récupérer les étudiants inscrits à un cours
export const fetchCourseStudents = async (courseId, token) => {
    try {
      const response = await axios.get(`${apiUrl}/${courseId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.students;
    } catch (error) {
      throw new Error("Erreur lors du chargement des étudiants : " + error.message);
    }
  };
  
  // Supprimer un étudiant d'un cours
  export const removeStudentFromCourse = async (courseId, studentId, token) => {
    try {
      await axios.delete(`${apiUrl}/${courseId}/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return studentId; // Retourner l'ID de l'étudiant supprimé pour mise à jour locale
    } catch (error) {
      throw new Error("Erreur lors de la suppression de l'étudiant : " + error.message);
    }
  };


  // Supprimer un cours
export const deleteCourse = async (courseId, token) => {
    const headers = { Authorization: `Bearer ${token}` };
  
    try {
      const response = await axios.delete(`${apiUrl}/${courseId}`, { headers });
  
      if (response.status === 200) {
        return response.data.message;  // Retourne le message de succès de la réponse
      } else {
        throw new Error("Course deletion failed");
      }
    } catch (error) {
      throw new Error("Error deleting course: " + error.message);
    }
  };
  
// Ajouter cette fonction dans le fichier services/coursapi.js

// Inviter un étudiant à rejoindre un cours par email
export const inviteStudentToCourse = async (courseId, email, token) => {
  const headers = { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const response = await axios.post(
      `${apiUrl}/${courseId}/invite`, 
      { email }, // Corps de la requête
      { headers } // Headers
    );

    return response.data;
  } catch (error) {
    console.error("Erreur API:", error);
    if (error.response) {
      throw new Error(error.response.data.message || "Erreur lors de l'envoi de l'invitation");
    } else {
      throw new Error("Erreur de connexion au serveur");
    }
  }
};
// Mettre à jour un cours
export const updateCourse = async (courseId, courseData, token) => {
  try {
  //  console.log("Frontend sending data:", courseData);
    
    // Créer un nouvel objet FormData
    const formData = new FormData();
    
    // Vérifier que les champs existent avant de les ajouter
    // et les ajouter exactement comme attendus par le backend
    if (courseData.title !== undefined) {
      formData.append('title', courseData.title);
    }
    
    if (courseData.description !== undefined) {
      formData.append('description', courseData.description);
    }
    
    // Ajouter l'ID du cours directement dans le formData
    // (au cas où le backend en aurait besoin)
    formData.append('courseId', courseId);
    
    // Ajouter le fichier s'il existe, en utilisant le nom 'image' 
    // pour correspondre au code backend qui semble utiliser ce nom
    if (courseData.imageFile) {
      formData.append('file', courseData.imageFile);
    }
    
    /*Déboguer le contenu de FormData
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }*/

    // Envoyer la requête avec les headers appropriés
    const response = await axios.put(`${apiUrl}/${courseId}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        // Ne pas définir Content-Type, il sera automatiquement 
        // défini comme 'multipart/form-data' avec la boundary
      },
    });

    if (response.status === 200) {
      return response.data.course || response.data;
    }
    throw new Error('La mise à jour du cours a échoué');
    
  } catch (error) {
    // Gestion améliorée des erreurs
    let errorMessage = 'Erreur lors de la mise à jour du cours';
    
    if (error.response) {
      // Erreur retournée par le serveur
      errorMessage = error.response.data.message || errorMessage;
      console.error("Erreur serveur:", error.response.data);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      errorMessage = 'Pas de réponse du serveur';
    } else {
      console.error("Erreur:", error.message);
    }
    
    throw new Error(errorMessage);
  }
};
