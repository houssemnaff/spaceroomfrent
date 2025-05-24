import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/courseassignment`; // URL pour les devoirs
const API_URLSub = `${import.meta.env.VITE_API_URL}/courssubmission`; // URL pour les soumissions

// Récupérer les devoirs d'un cours
export const fetchCourseAssignments = async (courseId, token) => {
  try {
    const response = await axios.get(`${API_URL}/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération des devoirs");
  }
};


export const generateAssignmentWithAI = async (assignmentData, token) => {
  try {
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(assignmentData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la génération du devoir avec l\'IA');
    }
    
    return response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
};

// Créer un devoir
export const createAssignment = async (assignmentData, token) => {
  try {
    const formData = new FormData();

    // Ajouter les champs texte
    Object.keys(assignmentData).forEach((key) => {
      if (key !== 'attachments') {
        formData.append(key, assignmentData[key]);
      }
    });

    // Ajouter les fichiers joints
    if (assignmentData.attachments && assignmentData.attachments.length > 0) {
      assignmentData.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    const response = await axios.post(API_URL, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erreur lors de la création du devoir");
  }
};export const updateAssignment = async (id, assignmentData, token) => {
  try {
    const formData = new FormData();

    // Ajouter les champs texte
    Object.keys(assignmentData).forEach((key) => {
      if (key !== 'newAttachments' && key !== 'removeAttachments') {
        formData.append(key, assignmentData[key]);
      }
    });

    // Ajouter les nouveaux fichiers joints
    if (assignmentData.newAttachments?.length > 0) {
      assignmentData.newAttachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    // Ajouter les fichiers à supprimer (comme tableau JSON stringifié)
    if (assignmentData.removeAttachments?.length > 0) {
      formData.append('removeAttachments', JSON.stringify(assignmentData.removeAttachments));
    }

    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour du devoir");
  }
};

// Supprimer un devoir
export const deleteAssignment = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erreur lors de la suppression du devoir");
  }
};
// Soumettre un devoir
export const submitAssignment = async (submissionData, token) => {
    try {
      const formData = new FormData();
  
      // Ajouter les champs texte (y compris content ou autres)
      Object.keys(submissionData).forEach((key) => {
        if (key !== 'attachments') {
          formData.append(key, submissionData[key]);
        }
      });
  
      // Vérifie que le content est bien ajouté à FormData
    /*  console.log("Form Data contient :");
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });*/
  
      // Ajouter les fichiers joints (attachments)
      if (submissionData.attachments && submissionData.attachments.length > 0) {
        submissionData.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }
  
      // Faire la requête HTTP
      const response = await axios.post(`${API_URLSub}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erreur lors de la soumission du devoir");
    }
  };
  
  
// Récupérer toutes les soumissions d'un devoir
export const fetchAssignmentSubmissions = async (assignmentId, token) => {
  try {
    const response = await axios.get(`${API_URLSub}/assignment/${assignmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération des soumissions");
  }
};


// Change this function to fetch submission by assignment ID
export const fetchMySubmission = async (assignmentId, token) => {
    try {
      const response = await axios.get(`${API_URLSub}/my/assignment/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // Pas encore de soumission
      }
      throw new Error(error.response?.data?.message || "Erreur lors de la récupération de votre soumission");
    }
  };


// Noter une soumission
export const gradeSubmission = async (submissionId, gradeData, token) => {
  try {
    const response = await axios.put(`${API_URLSub}/grade/${submissionId}`, gradeData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erreur lors de la notation de la soumission");
  }
};