import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddChapterDialog from "../Popup/addchapitre/chapitrepopup";
import { useOutletContext } from "react-router-dom";
import { fetchChapters, deleteChapter } from "@/services/chapterApi"; // Importez la fonction deleteChapter
import ChapterCard from "./ChapterCard";
import { useTheme } from "../../../pages/admin/componnents/themcontext";
import { toast } from "react-toastify";
import { useAuth } from "@/pages/auth/authContext";

export const ChaptersList = () => {
  const { courseDetails, isOwner } = useOutletContext();
  const courseId = courseDetails?._id;
  const [chapters, setChapters] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedChapters, setExpandedChapters] = useState({});
  const { theme } = useTheme();
  const isDark = theme === 'dark';
const {user,token}= useAuth();
  // Fetch chapters from the API with toast
  const loadChapters = async () => {
    if (!courseId) return;

    setLoading(true);
    setError("");

    try {
      const chaptersData = await fetchChapters(courseId,token);
      setChapters(chaptersData);
      
      // Initialize all chapters as expanded
      const initialExpandState = {};
      chaptersData.forEach(chapter => {
        initialExpandState[chapter._id] = true;
      });
      setExpandedChapters(initialExpandState);
    } catch (err) {
      console.error("Error fetching chapters:", err);
      toast.error("Impossible de charger les chapitres ", {
        containerId: "devoirs-toast"

      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChapters();
  }, [courseId]);

  // Add a new chapter with toast
  const handleAddChapter = async (newChapter) => {
    setChapters((prevChapters) => [...prevChapters, newChapter]);
    setExpandedChapters(prev => ({...prev, [newChapter._id]: true}));
    toast.success("Chapitre ajouté avec succès ! ", {
      containerId: "devoirs-toast"

    });
  };

  // Delete a chapter with toast
  const handleDeleteChapter = async (chapterId) => {
    try {
      // Appeler l'API pour supprimer le chapitre
      await deleteChapter(courseId, chapterId,token);
      
      // Mettre à jour l'état local après la suppression
      setChapters((prevChapters) =>
        prevChapters.filter((chapter) => chapter._id !== chapterId)
      );
      
      // Supprimer l'état d'expansion pour ce chapitre
      setExpandedChapters(prev => {
        const newState = {...prev};
        delete newState[chapterId];
        return newState;
      });
      
      toast.success("Chapitre supprimé avec succès ! ", {
        containerId: "devoirs-toast"

      });
    } catch (err) {
      console.error("Error deleting chapter:", err);
      toast.error("Erreur lors de la suppression du chapitre ", {
        containerId: "devoirs-toast"

      });
    }
  };

  // Edit a chapter with toast
  const handleEditChapter = (updatedChapter) => {
    setChapters((prevChapters) =>
      prevChapters.map((chapter) =>
        chapter._id === updatedChapter._id ? { ...chapter, ...updatedChapter } : chapter
      )
    );
  };

  // Toggle chapter expansion
  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  return (
    <section className={`p-6 md:p-8 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Chapitres du cours</h2>
        {isOwner && (
          <Button 
            onClick={() => setIsPopupOpen(true)} 
            className={`mt-4 md:mt-0 rounded-full ${isDark ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600'}`}
          >
            <Plus className="mr-2 h-4 w-4" /> Ajouter un chapitre
          </Button>
        )}
      </div>

      {error && <p className={`mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
      
      {loading ? (
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Chargement des chapitres...</p>
      ) : chapters.length === 0 ? (
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Aucun chapitre disponible.</p>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <ChapterCard
              key={chapter._id}
              chapter={chapter}
              courseId={courseId}
              isOwner={isOwner}
              isExpanded={expandedChapters[chapter._id]}
              onToggleExpand={() => toggleChapter(chapter._id)}
              onDelete={handleDeleteChapter}
              onEdit={handleEditChapter}
            />
          ))}
        </div>
      )}

      <AddChapterDialog
        courseId={courseId}
        open={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleAddChapter}
      />
    </section>
  );
};

export default ChaptersList;