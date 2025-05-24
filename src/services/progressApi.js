import axios from 'axios';
const apiUrl = `${import.meta.env.VITE_API_URL}/course`;
export const fetchCourseProgress = async (userId, courseId, token) => {
  try {
    const response = await axios.get(`${apiUrl}/progress/${userId}/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching course progress:', error);
    throw error;
  }
};

export const markResourceViewed = async (userId, courseId, resourceId, chapterId, token) => {
  try {
    const response = await axios.post(`${apiUrl}/progress/resource`, {
      userId,
      courseId,
      resourceId,
      chapterId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking resource as viewed:', error);
    throw error;
  }
};