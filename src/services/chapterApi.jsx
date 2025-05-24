// src/services/chapterApi.js
import axios from 'axios';

const apiUrl = `${import.meta.env.VITE_API_URL}/course`;

// Fetch chapters from the API
export const fetchChapters = async (courseId,token) => {
  try {
    const response = await axios.get(`${apiUrl}/${courseId}/chapters`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }

    );
    return response.data.chapters;
  } catch (error) {
    throw new Error("Error fetching chapters: " + error.message);
  }
};
// Add a new chapter
export const addChapter = async (courseId, chapterData, token) => {
    try {
      const response = await axios.post(
        `${apiUrl}/${courseId}/add-chapter`,
        chapterData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Sending JSON data
          },
        }
      );
      return response.data.chapter;
    } catch (error) {
      throw new Error("Error adding chapter: " + error.message);
    }
  };
// Update chapter
export const updateChapter = async (courseId, chapterId, chapterData,token) => {
  try {
    const response = await axios.put(
      `${apiUrl}/${courseId}/chapters/${chapterId}`,
     { chapterData},
     {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
    );
    return response.data.chapter;
  } catch (error) {
    throw new Error("Error updating chapter: " + error.message);
  }
};

// Delete chapter
export const deleteChapter = async (courseId, chapterId,token) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/${courseId}/chapters/${chapterId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.status === 200;
  } catch (error) {
    throw new Error("Error deleting chapter: " + error.message);
  }
};

// Ajouter une ressource à un chapitre
export const addResourceToChapter = async (courseId, chapterId, resourceData, token) => {
  try {
    const response = await axios.post(
      `${apiUrl}/${courseId}/chapter/${chapterId}/resource`,
      resourceData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.resource;
  } catch (error) {
    throw new Error("Error adding resource: " + error.message);
  }
};
//Method to fetch resources for a specific chapter
export const fetchChapterResources = async (courseId, chapterId,token) => {
  try {
    const response = await axios.get(
      `${apiUrl}/${courseId}/chapter/${chapterId}/resources`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.resources;
  } catch (error) {
    throw new Error("Error fetching resources: " + error.message);
  }
};

//Method to fetch resources for a specific chapter
export const deleteResource = async (courseId, chapterId,resourceid,token) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/${courseId}/chapter/${chapterId}/resources/${resourceid}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.resources;
  } catch (error) {
    throw new Error("Error fetching resources: " + error.message);
  }
};
