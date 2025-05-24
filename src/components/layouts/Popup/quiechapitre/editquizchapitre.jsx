import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import QuizService from "@/services/quizchapitreapi";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import { useAuth } from "@/pages/auth/authContext";

const EditQuizDialog = ({ isOpen, onClose, courseId, chapterId, quiz, onQuizUpdated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const { token } = useAuth();

  // Initialize form data when quiz changes
  useEffect(() => {
    if (quiz && isOpen) {
      console.log("Initializing quiz data:", quiz);
      
      setTitle(quiz.title || "");
      setDescription(quiz.description || "");
      setTimeLimit(quiz.timeLimit || 30);
      
      // Safely format questions
      let formattedQuestions = [];
      
      if (Array.isArray(quiz.questions) && quiz.questions.length > 0) {
        formattedQuestions = quiz.questions.map((q, index) => {
          console.log(`Processing question ${index}:`, q);
          
          return {
            text: q.text || "",
            options: Array.isArray(q.options) && q.options.length > 0
              ? q.options.map(opt => ({
                  text: opt.text || "",
                  isCorrect: Boolean(opt.isCorrect)
                }))
              : Array(2).fill(null).map(() => ({ text: "", isCorrect: false }))
          };
        });
      } else {
        // If no questions, add one default question with 2 options
        formattedQuestions = [{
          text: "",
          options: Array(2).fill(null).map(() => ({ text: "", isCorrect: false }))
        }];
      }
      
      setQuestions(formattedQuestions);
      console.log("Formatted questions:", formattedQuestions);
    }
  }, [quiz, isOpen]);

  // Validation function to check for duplicate options
  const validateOptions = (questionIndex) => {
    const question = questions[questionIndex];
    const optionTexts = question.options.map(opt => opt.text.trim().toLowerCase());
    const uniqueTexts = new Set(optionTexts);
    
    // Si certains textes sont vides ou si il y a des doublons
    return optionTexts.every(text => text !== "") && 
           uniqueTexts.size === question.options.length;
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.info("Le titre est requis", {
        containerId: "devoirs-toast"
  
      });
      return false;
    }
    
    if (!description.trim()) {
      toast.info("La description est requise", {
        containerId: "devoirs-toast"
  
      });
      return false;
    }
    
    if (questions.length === 0) {
      toast.info("Au moins une question est requise", {
        containerId: "devoirs-toast"
  
      });
      return false;
    }
    
    // Validation des doublons
    const hasDuplicates = questions.some((q, qIndex) => {
      const optionTexts = q.options.map(opt => opt.text.trim().toLowerCase());
      const uniqueTexts = new Set(optionTexts);
      return uniqueTexts.size !== q.options.length || optionTexts.some(text => text === "");
    });
    
    if (hasDuplicates) {
      toast.error("Certaines questions ont des options en double ou vides. Veuillez corriger avant de soumettre.", {
        containerId: "devoirs-toast"
  
      });
      return false;
    }
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.text.trim()) {
        toast.error(`La question ${i + 1} ne peut pas être vide`, {
          containerId: "devoirs-toast"
    
        });
        return false;
      }
      
      const validOptions = question.options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        toast.error(`La question ${i + 1} doit avoir au moins 2 options avec du texte`, {
          containerId: "devoirs-toast"
    
        });
        return false;
      }
      
      const hasCorrectAnswer = question.options.some(opt => opt.isCorrect && opt.text.trim());
      if (!hasCorrectAnswer) {
        toast.error(`La question ${i + 1} doit avoir au moins une réponse correcte`, {
          containerId: "devoirs-toast"
    
        });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      // Clean and validate questions data
      const cleanedQuestions = questions.map(q => ({
        text: q.text.trim(),
        options: q.options
          .filter(opt => opt.text.trim()) // Remove empty options
          .map(opt => ({
            text: opt.text.trim(),
            isCorrect: Boolean(opt.isCorrect)
          }))
      }));

      console.log("Submitting quiz update:", {
        title: title.trim(),
        description: description.trim(),
        timeLimit: parseInt(timeLimit),
        questions: cleanedQuestions
      });

      const updateData = {
        title: title.trim(),
        description: description.trim(),
        timeLimit: parseInt(timeLimit),
        questions: cleanedQuestions
      };

      const result = await QuizService.updateQuiz(quiz._id, token, updateData);
      
      if (result.success) {
        toast.success( "Quiz mis à jour avec succès", {
          containerId: "devoirs-toast"
    
        });
        onQuizUpdated(result.data);
        onClose();
      } else {
        throw new Error(result.message || "Erreur lors de la mise à jour");
      }

    } catch (error) {
      console.error("Error updating quiz:", error);
      
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach(err => toast.error(err));
      } else {
        toast.error(error.message || "Erreur lors de la mise à jour du quiz", {
          containerId: "devoirs-toast"
    
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      text: "",
      options: Array(2).fill(null).map(() => ({ text: "", isCorrect: false }))
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const handleCorrectOptionChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    // Set all options to false first
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.map(opt => ({
      ...opt,
      isCorrect: false
    }));
    // Set the selected option to true
    updatedQuestions[questionIndex].options[optionIndex].isCorrect = true;
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index) => {
    if (questions.length === 1) {
      toast.warning("Vous devez garder au moins une question", {
        containerId: "devoirs-toast"
  
      });
      return;
    }
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  // Add option to a specific question
  const handleAddOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({ text: "", isCorrect: false });
    setQuestions(updatedQuestions);
  };

  // Remove option from a specific question
  const handleRemoveOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length <= 2) {
      toast.warning("Vous devez garder au moins deux options par question", {
        containerId: "devoirs-toast"
  
      });
      return;
    }
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setDescription("");
      setTimeLimit(30);
      setQuestions([]);
      setLoading(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le Quiz</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields remain the same but with better validation feedback */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre du quiz"
                required
                className={!title.trim() && loading ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du quiz"
                required
                className={!description.trim() && loading ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeLimit">Durée (minutes) *</Label>
              <Input
                id="timeLimit"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                min="1"
                max="180"
                required
              />
            </div>
            
            {quiz?.availableFrom && (
              <div className="text-sm text-gray-600">
                Le quiz sera disponible le {new Date(quiz.availableFrom).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>

          {/* Questions Section with improved validation and duplicate detection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Questions ({questions.length})</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
                Ajouter une question
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <Label className="text-lg font-semibold">
                        Question {questionIndex + 1} *
                      </Label>
                      <Textarea
                        value={question.text}
                        onChange={(e) => handleQuestionChange(questionIndex, "text", e.target.value)}
                        placeholder="Entrez votre question"
                        required
                        className={`min-h-[100px] ${!question.text.trim() && loading ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(questionIndex)}
                        className="text-red-500 ml-2"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-md font-medium">Options de réponse * (minimum 2)</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddOption(questionIndex)}
                        className="flex items-center gap-1"
                        disabled={loading}
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter une option
                      </Button>
                    </div>
                    
                    {question.options.map((option, optionIndex) => {
                      const hasDuplicate = question.options.some(
                        (opt, idx) => 
                          idx !== optionIndex && 
                          opt.text.trim().toLowerCase() === option.text.trim().toLowerCase() && 
                          option.text.trim() !== ""
                      );

                      return (
                        <div 
                          key={optionIndex} 
                          className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                            option.isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-white border'
                          } ${hasDuplicate ? 'border-red-500 bg-red-50' : ''}`}
                        >
                          <div className="flex-grow">
                            <Input
                              value={option.text}
                              onChange={(e) => handleOptionChange(questionIndex, optionIndex, "text", e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              required
                              className={`${option.isCorrect ? 'border-green-300' : ''} ${
                                hasDuplicate ? 'border-red-500' : ''
                              }`}
                            />
                            {hasDuplicate && (
                              <p className="text-xs text-red-500 mt-1">
                                Cette réponse est en double
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <input
                              type="radio"
                              name={`correct-${questionIndex}`}
                              checked={option.isCorrect}
                              onChange={() => handleCorrectOptionChange(questionIndex, optionIndex)}
                              className="w-4 h-4 accent-green-500"
                              disabled={loading}
                              required
                            />
                            <Label className={`text-sm cursor-pointer ${option.isCorrect ? 'text-green-600 font-medium' : ''}`}>
                              {option.isCorrect ? '✓ Correcte' : 'Correcte'}
                            </Label>
                          </div>
                          {question.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                              className="text-red-500"
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Mise à jour en cours..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuizDialog;