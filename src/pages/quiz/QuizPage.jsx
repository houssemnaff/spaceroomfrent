import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuizComponent from "@/components/layouts/Popup/quiechapitre/quizchapitre";
import { useAuth } from "@/pages/auth/authContext";
import QuizService from "@/services/quizchapitreapi";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Play } from "lucide-react";

const QuizPage = () => {
  const { id: courseId, chapterId, quizId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!courseId || !chapterId || !quizId) {
        console.error("Missing required params:", { courseId, chapterId, quizId });
        setError("Paramètres manquants");
        setLoading(false);
        return;
      }

      try {
        const response = await QuizService.getQuiz(quizId, token);
        if (response?.data) {
          setQuiz({
            ...response.data,
            courseId: courseId,
            courseOwnerId: response.data.owner
          });
        } else {
          throw new Error("Quiz data not found");
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Impossible de charger le quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, token, courseId, chapterId]);

  const handleBack = () => {
    navigate(`/home/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={handleBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Retour au chapitre</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-6">
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-4 sm:mb-6"
        size="sm"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Retour au chapitre</span>
      </Button>
      
      {quiz ? (
        <QuizComponent
          quiz={quiz}
          courseId={courseId}
          chapterId={chapterId}
          courseOwnerId={quiz.courseOwnerId}
        />
      ) : (
        <div className="text-center text-gray-500">
          <p>Quiz non trouvé</p>
          <Button 
            onClick={handleBack} 
            variant="outline" 
            className="mt-4 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Retour</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizPage;