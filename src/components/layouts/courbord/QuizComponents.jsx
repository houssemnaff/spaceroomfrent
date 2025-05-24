/*   

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, ListChecks } from "lucide-react";
import AddQuizDialog from "../Popup/quiechapitre/addquizchapitre";
import QuizComponent from "../Popup/quiechapitre/quizchapitre";
import QuizService from "@/services/quizchapitreapi";
import { useAuth } from "@/pages/auth/authContext";
import { toast } from "react-toastify";

const QuizComponents = ({
  isOwner,
  isMobile,
  quizzes,
  isLoading,
  courseId,
  chapterId,
  onQuizAdded,
  onQuizDeleted,
  setError,
  courseOwnerId
}) => {
  const { token, user } = useAuth();
  const [isAddQuizOpen, setIsAddQuizOpen] = React.useState(false);
  const [selectedQuiz, setSelectedQuiz] = React.useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = React.useState(false);

  // Handle quiz click
  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setIsQuizModalOpen(true);
  };

  // Handle quiz completion
  const handleQuizComplete = async (results) => {
    try {
      if (!user?._id) {
        toast.error("Vous devez être connecté pour sauvegarder vos réponses");
        return;
      }

      const progressData = {
        quizId: results.quizId,
        userId: user._id,
        score: results.score,
        totalQuestions: results.totalQuestions,
        answers: results.answers,
        completed: results.completed,
        completedAt: new Date().toISOString()
      };

      const response = await QuizService.saveQuizProgress(progressData, token);
      if (response?.data) {
        toast.success("Progrès du quiz sauvegardé avec succès!");
        // Rafraîchir les données du quiz
        if (onQuizAdded) {
          onQuizAdded(response.data);
        }
      } else {
        throw new Error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving quiz progress:", error);
      toast.error("Erreur lors de la sauvegarde du progrès");
      setError("Impossible de sauvegarder le progrès du quiz");
    }
  };

  // Handle quiz deletion
  const handleQuizDelete = async (quizId, e) => {
    e.stopPropagation();
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce quiz ?")) {
      return;
    }

    try {
      await QuizService.deleteQuiz(quizId, token);
      onQuizDeleted(quizId);
      toast.success("Quiz supprimé avec succès");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Impossible de supprimer le quiz");
      setError("Impossible de supprimer le quiz");
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium text-gray-700">Quiz</h4>
        {isOwner && (
          isMobile ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-purple-600"  
              onClick={() => setIsAddQuizOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-purple-600 border-purple-600"  
              onClick={() => setIsAddQuizOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Ajouter un quiz
            </Button>
          )
        )}
      </div>
      
      {isLoading ? (
        <p className="text-gray-500 text-sm">Chargement des quiz...</p>
      ) : quizzes.length > 0 ? (
        <div className="space-y-2">
          {quizzes.map((quiz) => (
            <div 
              key={quiz._id}
              className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => handleQuizClick(quiz)}
            >
              <div className="flex items-center">
                <ListChecks className="h-4 w-4 mr-2 text-purple-500" />
                <span className="text-sm font-medium">{quiz.title}</span>
              </div>
              
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={(e) => handleQuizDelete(quiz._id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Aucun quiz disponible</p>
      )}

     
      {isAddQuizOpen && (
        <AddQuizDialog
          isOpen={isAddQuizOpen}
          onClose={() => setIsAddQuizOpen(false)}
          courseId={courseId}
          chapterId={chapterId}
          onQuizAdded={onQuizAdded}
        />
      )}
      
      
      {isQuizModalOpen && selectedQuiz && (
        <Dialog open={isQuizModalOpen} onOpenChange={setIsQuizModalOpen}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedQuiz.title}</DialogTitle>
            </DialogHeader>
            <QuizComponent
              quiz={selectedQuiz} 
              courseId={courseId}
              chapterId={chapterId}
              courseOwnerId={courseOwnerId}
              onComplete={handleQuizComplete}
            />
            <DialogFooter>
              <Button type="button" onClick={() => setIsQuizModalOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default QuizComponents; 
*/