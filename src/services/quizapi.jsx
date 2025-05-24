import axios from 'axios';

// Set the base URL for API requests
const API_URL = 'http://localhost:5000/quiz'; // Adjust this if your API is hosted on a different base URL

// Create a new quiz
export const createQuiz = async (quizData, token) => {
  try {
    const response = await axios.post(`${API_URL}`, quizData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error.response ? error.response.data : error;
  }
};

// Get all quizzes created by the authenticated user
export const getMyQuizzes = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/my-quizzes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw error.response ? error.response.data : error;
  }
};

// Get all quizzes joined by the authenticated user
export const getJoinedQuizzes = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/joined-quizzes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching joined quizzes:", error);
    throw error.response ? error.response.data : error;
  }
};

// Get quizzes for a specific course
export const getCourseQuizzes = async (courseId, token) => {
  try {
    const response = await axios.get(`${API_URL}/course/${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching course quizzes:", error);
    throw error.response ? error.response.data : error;
  }
};

// Get a specific quiz with its questions
export const getQuiz = async (quizId, token) => {
  try {
    const response = await axios.get(`${API_URL}/${quizId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching quiz:", error);
    throw error.response ? error.response.data : error;
  }
};

// Start a quiz attempt
export const startQuiz = async (quizId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/${quizId}/start`, 
      {}, // Empty body object
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error starting quiz:", error);
    throw error.response ? error.response.data : error;
  }
};
// Submit quiz answers
export const submitQuizAnswers = async (quizId, answers, token) => {
    try {
      const response = await axios.post(
        `${API_URL}/${quizId}/submit`,  // Adjusted endpoint path to match likely API structure
        { answers },  // Correct body with answers array
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting quiz:", error);
      throw error.response ? error.response.data : error;
    }
  };

// Get quiz results
export const getQuizResults = async (quizId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/${quizId}/results`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    throw error.response ? error.response.data : error;
  }
};

// Update a quiz
export const updateQuiz = async (quizId, quizData, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/${quizId}`, 
      quizData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error.response ? error.response.data : error;
  }
};

// Delete a quiz
export const deleteQuiz = async (quizId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${quizId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting quiz:", error);
    throw error.response ? error.response.data : error;
  }
};

// Add a question to a quiz
export const createQuestion = async (quizId, questionData, token) => {
  try {
    const response = await axios.post(`${API_URL}/${quizId}/questions`, questionData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding question:", error);
    throw error.response ? error.response.data : error;
  }
};

// Join a quiz with access key
export const joinQuiz = async (accessKey, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/join`,
      { accessKey },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error joining quiz:", error);
    throw error.response ? error.response.data : error;
  }
};

// Associate a quiz with a course
export const associateQuizToCourse = async (quizId, courseId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/${quizId}/associate/${courseId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error associating quiz with course:", error);
    throw error.response ? error.response.data : error;
  }
};