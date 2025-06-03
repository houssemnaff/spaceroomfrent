import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const adminService = {
  // ================ Dashboard ================
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      handleError(error, 'statistiques du dashboard');
    }
  },

  getStudentEngagement: async () => {
    try {
      const response = await api.get('/dashboard/engagement');
      return response.data;
    } catch (error) {
      handleError(error, 'données d\'engagement');
    }
  },

  getGradeDistribution: async () => {
    try {
      const response = await api.get('/dashboard/grades');
      return response.data;
    } catch (error) {
      handleError(error, 'distribution des notes');
    }
  },

  getActivityHeatmap: async () => {
    try {
      const response = await api.get('/dashboard/activity');
      return response.data;
    } catch (error) {
      handleError(error, 'heatmap d\'activité');
    }
  },

  getTopStudents: async (limit = 5) => {
    try {
      const response = await api.get(`/dashboard/students/top?limit=${limit}`);
      return response.data;
    } catch (error) {
      handleError(error, 'meilleurs étudiants');
    }
  },

  getPopularCourses: async (limit = 3) => {
    try {
      const response = await api.get(`/dashboard/courses/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      handleError(error, 'cours populaires');
    }
  },

  // ================ Courses ================
  getAllCourses: async () => {
    try {
      const response = await api.get('/courses');
      return response.data;
    } catch (error) {
      handleError(error, 'liste des cours');
    }
  },
   createCourseWithOwner: async (courseData) => {
    try {
      const response = await api.post('/courses/with-owner', courseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCourseById: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'détails du cours');
    }
  },

  createCourse: async (courseData) => {
    try {
      const response = await api.post('/courses', courseData);
      return response.data;
    } catch (error) {
      handleError(error, 'création de cours');
    }
  },

  updateCourse: async (courseId, courseData) => {
    try {
      const response = await api.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      handleError(error, 'mise à jour du cours');
    }
  },

  deleteCourse: async (courseId) => {
    try {
      const response = await api.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'suppression du cours');
    }
  },

  getCourseStats: async (courseId) => {
    try {
      const response = await api.get(`/courses/stats/${courseId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'statistiques du cours');
    }
  },

  getAllCoursesWithStats: async () => {
    try {
      const response = await api.get('/courses/all/stats');
      return response.data;
    } catch (error) {
      handleError(error, 'cours avec statistiques');
    }
  },

  // ================ Meetings ================
  getAllMeetings: async () => {
    try {
      const response = await api.get('/meetings');
      return response.data;
    } catch (error) {
      handleError(error, 'liste des réunions');
    }
  },

  getMeetingById: async (meetingId) => {
    try {
      const response = await api.get(`/meetings/${meetingId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'détails de la réunion');
    }
  },

  createMeeting: async (meetingData) => {
    try {
      const response = await api.post('/meetings', meetingData);
      return response.data;
    } catch (error) {
      handleError(error, 'création de réunion');
    }
  },

  updateMeeting: async (meetingId, meetingData) => {
    try {
      const response = await api.put(`/meetings/${meetingId}`, meetingData);
      return response.data;
    } catch (error) {
      handleError(error, 'mise à jour de la réunion');
    }
  },

  deleteMeeting: async (meetingId) => {
    try {
      const response = await api.delete(`/meetings/${meetingId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'suppression de la réunion');
    }
  },

  // ================ Resources ================
  getAllResources: async () => {
    try {
      const response = await api.get('/resources');
      return response.data;
    } catch (error) {
      handleError(error, 'liste des ressources');
    }
  },

  getResourceById: async (resourceId) => {
    try {
      const response = await api.get(`/resources/${resourceId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'détails de la ressource');
    }
  },

  createResource: async (resourceData) => {
    try {
      const response = await api.post('/resources', resourceData);
      return response.data;
    } catch (error) {
      handleError(error, 'création de ressource');
    }
  },

  updateResource: async (resourceId, resourceData) => {
    try {
      const response = await api.put(`/resources/${resourceId}`, resourceData);
      return response.data;
    } catch (error) {
      handleError(error, 'mise à jour de la ressource');
    }
  },

  deleteResource: async (resourceId) => {
    try {
      const response = await api.delete(`/resources/${resourceId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'suppression de la ressource');
    }
  },

  // ================ Users ================
  getUserStats: async (userId) => {
    try {
      const response = await api.get(`/users/stats/${userId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'statistiques utilisateur');
    }
  },

  getAllUsersWithStats: async () => {
    try {
      const response = await api.get('/users/all/stats');
      return response.data;
    } catch (error) {
      handleError(error, 'utilisateurs avec statistiques');
    }
  },

  // ================ Enrollment ================
  enrollInCourse: async (courseId, accessKey) => {
    try {
      const response = await api.post('/enroll', { courseId, accessKey });
      return response.data;
    } catch (error) {
      handleError(error, 'inscription au cours');
    }
  },

  unenrollFromCourse: async (courseId) => {
    try {
      const response = await api.delete(`/enroll/${courseId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'désinscription du cours');
    }
  },

  // ================ Progress ================
  updateUserProgress: async (progressData) => {
    try {
      const response = await api.post('/progress', progressData);
      return response.data;
    } catch (error) {
      handleError(error, 'mise à jour de la progression');
    }
  },

  getUserProgressForCourse: async (courseId) => {
    try {
      const response = await api.get(`/progress/${courseId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'progression du cours');
    }
  },
  deleteuser: async (id,token) => {
    try {
      const response = await api.delete(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      handleError("Erreur lors de la suppression de l'utilisateur :", error);
      throw error;
    }
  },


  // ================ Analytics ================
  getSystemOverview: async () => {
    try {
      const response = await api.get('/analytics/overview');
      return response.data;
    } catch (error) {
      handleError(error, 'aperçu du système');
    }
  },

  getCategoryDistribution: async () => {
    try {
      const response = await api.get('/analytics/categories');
      return response.data;
    } catch (error) {
      handleError(error, 'distribution des catégories');
    }
  },

  getCourseCompletionRates: async () => {
    try {
      const response = await api.get('/analytics/completion-rates');
      return response.data;
    } catch (error) {
      handleError(error, 'taux de complétion des cours');
    }
  },

  getStudentSkills: async (studentId) => {
    try {
      const response = await api.get(`/analytics/student-skills/${studentId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'compétences de l\'étudiant');
    }
  },

  // ================ Chapters ================
  getAllChapters: async () => {
    try {
      const response = await api.get('/chapters');
      return response.data;
    } catch (error) {
      handleError(error, 'liste des chapitres');
    }
  },

  getChapterById: async (chapterId) => {
    try {
      const response = await api.get(`/chapters/${chapterId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'détails du chapitre');
    }
  },

  createChapter: async (chapterData) => {
    try {
      const response = await api.post('/chapters', chapterData);
      return response.data;
    } catch (error) {
      handleError(error, 'création de chapitre');
    }
  },

  updateChapter: async (chapterId, chapterData) => {
    try {
      const response = await api.put(`/chapters/${chapterId}`, chapterData);
      return response.data;
    } catch (error) {
      handleError(error, 'mise à jour du chapitre');
    }
  },

  deleteChapter: async (chapterId) => {
    try {
      const response = await api.delete(`/chapters/${chapterId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'suppression du chapitre');
    }
  },

  // ================ Quizzes ================
  getAllQuizzes: async () => {
    try {
      const response = await api.get('/quizzes');
      return response.data;
    } catch (error) {
      handleError(error, 'liste des quiz');
    }
  },

  getQuizById: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'détails du quiz');
    }
  },

  createQuiz: async (quizData) => {
    try {
      const response = await api.post('/quizzes', quizData);
      return response.data;
    } catch (error) {
      handleError(error, 'création de quiz');
    }
  },

  updateQuiz: async (quizId, quizData) => {
    try {
      const response = await api.put(`/quizzes/${quizId}`, quizData);
      return response.data;
    } catch (error) {
      handleError(error, 'mise à jour du quiz');
    }
  },

  deleteQuiz: async (quizId) => {
    try {
      const response = await api.delete(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'suppression du quiz');
    }
  },

  // ================ Assignments ================
  getAllAssignments: async () => {
    try {
      const response = await api.get('/assignments');
      return response.data;
    } catch (error) {
      handleError(error, 'liste des devoirs');
    }
  },

  getAssignmentById: async (assignmentId) => {
    try {
      const response = await api.get(`/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'détails du devoir');
    }
  },

  createAssignment: async (assignmentData) => {
    try {
      const response = await api.post('/assignments', assignmentData);
      return response.data;
    } catch (error) {
      handleError(error, 'création de devoir');
    }
  },

  updateAssignment: async (assignmentId, assignmentData) => {
    try {
      const response = await api.put(`/assignments/${assignmentId}`, assignmentData);
      return response.data;
    } catch (error) {
      handleError(error, 'mise à jour du devoir');
    }
  },

  deleteAssignment: async (assignmentId) => {
    try {
      const response = await api.delete(`/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'suppression du devoir');
    }
  },

  // ================ Total Counts ================
  getTotalCounts: async () => {
    try {
      const response = await api.get('/counts');
      return response.data;
    } catch (error) {
      handleError(error, 'comptages totaux');
    }
  }
};

// Fonction utilitaire pour gérer les erreurs
function handleError(error, context) {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        throw new Error(`Accès non autorisé pour les ${context}`);
      case 403:
        throw new Error(`Permissions insuffisantes pour accéder aux ${context}`);
      case 404:
        throw new Error(`${context} non trouvé(s)`);
      default:
        throw new Error(`Erreur serveur lors de la récupération des ${context}`);
    }
  } else {
    console.error(`Error with ${context}:`, error);
    throw new Error(`Erreur réseau lors de l'accès aux ${context}`);
  }
}