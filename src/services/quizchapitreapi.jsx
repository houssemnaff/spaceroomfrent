// src/services/QuizService.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/quizch`;

const validateId = (id) => {
  if (!id || typeof id !== 'string' || id === 'undefined') {
    throw new Error('Invalid ID provided');
  }
  return id;
};

const QuizService = {
  // Create a new quiz
  createQuiz: async (quizData, token) => {
    try {
      const response = await axios.post(API_URL, quizData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Quiz creation error:', error);
      throw error.response?.data || error;
    }
  },
  
  // Get a specific quiz
  getQuiz: async (quizId, token) => {
    try {
      if (!quizId) {
        console.warn('Missing quizId for getQuiz');
        return null;
      }

      const response = await axios.get(`${API_URL}/${validateId(quizId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Quiz fetch error:', error);
      throw error.response?.data || error;
    }
  },
  
  // Get all quizzes for a chapter
  getChapterQuizzes: async (chapterId, courseId, token) => {
    try {
      if (!chapterId || !courseId) {
        console.warn('Missing chapterId or courseId for getChapterQuizzes');
        return { data: [] };
      }

      const response = await axios.get(
        `${API_URL}/chapter/${validateId(chapterId)}/course/${validateId(courseId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response;
    } catch (error) {
      console.error('Chapter quizzes fetch error:', error);
      return { data: [] };
    }
  },
  
  // Get all quizzes for a course
  getCourseQuizzes: async (courseId, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    
    try {
      const response = await axios.get(`${API_URL}/course/${validateId(courseId)}`, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching course quizzes' };
    }
  },
  
  // Update a quiz
  updateQuiz: async (quizId,token, quizData) => {
    console.log("yokettttttttttttttttttttttttttttt ",token)

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    
    try {
      const response = await axios.put(`${API_URL}/${validateId(quizId)}`, quizData, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error updating quiz' };
    }
  },
  
  // Delete a quiz
  deleteQuiz: async (quizId, token) => {
    try {
      if (!quizId) {
        throw new Error('Missing quizId for deleteQuiz');
      }

      const response = await axios.delete(`${API_URL}/${validateId(quizId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Quiz deletion error:', error);
      throw error.response?.data || error;
    }
  },
  
  // Save quiz progress
  saveQuizProgress: async (progressData, token) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      // Ensure all required fields are present
      if (!progressData.userId || !progressData.quizId || !progressData.courseId || !progressData.chapterId) {
        throw new Error('Missing required IDs');
      }

      // Log the request data for debugging
      console.log('Sending quiz progress:', progressData);

      const response = await axios.post(
        `${API_URL}/progress`,
        progressData,
        config
      );

      return response;
    } catch (error) {
      console.error('Progress save error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server response:', error.response.data);
        throw error.response.data;
      }
      throw error;
    }
  },
  
  // Get quiz progress
  getQuizProgress: async (quizId, userId, token) => {
    try {
      // Validate IDs before making the request
      if (!quizId || !userId) {
        console.warn('Missing quizId or userId for getQuizProgress');
        return null;
      }

      const response = await axios.get(
        `${API_URL}/progress/${validateId(quizId)}/${validateId(userId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response;
    } catch (error) {
      if (error.message === 'Invalid ID provided') {
        console.warn('Invalid ID provided to getQuizProgress');
        return null;
      }
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Progress fetch error:', error);
      throw error.response?.data || error;
    }
  },
  
  // Get all attempts (for instructor)
  getAllAttempts: async (quizId, token) => {
    try {
      if (!quizId) {
        console.warn('Missing quizId for getAllAttempts');
        return { data: [] };
      }

      const response = await axios.get(
        `${API_URL}/attempts/${validateId(quizId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response;
    } catch (error) {
      if (error.message === 'Invalid ID provided') {
        console.warn('Invalid ID provided to getAllAttempts');
        return { data: [] };
      }
      console.error('Attempts fetch error:', error);
      return { data: [] };
    }
  },
  
  // Get student's attempts for a quiz
  getStudentAttempts: async (quizId, userId, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    
    try {
      const response = await axios.get(
        `${API_URL}/attempts/student/${validateId(quizId)}/${validateId(userId)}`,
        config
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching student attempts' };
    }
  }
};

export default QuizService;