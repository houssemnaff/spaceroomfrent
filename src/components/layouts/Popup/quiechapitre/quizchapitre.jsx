import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Users, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/pages/auth/authContext";
import QuizService from "@/services/quizchapitreapi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";

const QuizComponent = ({ quiz, courseId, chapterId, courseOwnerId }) => {
  const { token, user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState(Array(quiz.questions.length).fill(null));
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizProgress, setQuizProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [quizStatus, setQuizStatus] = useState('loading');
  const [previousAttempt, setPreviousAttempt] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [isQuizAvailable, setIsQuizAvailable] = useState(true);
  const [timeUntilStart, setTimeUntilStart] = useState(null);

  // Check quiz availability
  useEffect(() => {
    const checkQuizAvailability = () => {
      if (!quiz.availableFrom) {
        setIsQuizAvailable(true);
        return;
      }

      const now = new Date();
      const availableDate = new Date(quiz.availableFrom);
      
      if (now >= availableDate) {
        setIsQuizAvailable(true);
        setTimeUntilStart(null);
      } else {
        setIsQuizAvailable(false);
        
        const timeDiff = availableDate.getTime() - now.getTime();
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeUntilStart({ hours, minutes });
      }
    };

    checkQuizAvailability();
    
    // Update availability every minute
    const availabilityInterval = setInterval(checkQuizAvailability, 60000);
    
    return () => clearInterval(availabilityInterval);
  }, [quiz.availableFrom]);

  // Vérifier si l'étudiant a déjà fait le quiz
  useEffect(() => {
    const checkPreviousAttempt = async () => {
      if (!user?._id || !quiz?._id || user._id === courseOwnerId) return;

      try {
        const response = await QuizService.getQuizProgress(quiz._id, user._id, token);
        if (response?.data) {
          setPreviousAttempt(response.data);
          setQuizStatus('completed');
        } else {
          setQuizStatus('waiting');
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError("Erreur lors de la vérification des tentatives précédentes");
        } else {
          setQuizStatus('waiting');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkPreviousAttempt();
  }, [quiz, user, token, courseOwnerId]);

  // Vérifier si l'utilisateur est l'enseignant
  useEffect(() => {
    if (user && courseOwnerId) {
      const isTeacherUser = user._id === courseOwnerId;
      setIsTeacher(isTeacherUser);
    }
  }, [user, courseOwnerId]);

  // Timer pour le quiz
  useEffect(() => {
    let timer;
    
    if (quizStatus === 'in-progress' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Soumettre automatiquement le quiz quand le temps est écoulé
            handleSubmitQuiz();
            toast.warning("Temps écoulé ! Le quiz a été soumis automatiquement.", {
              containerId: "devoirs-toast"
        
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizStatus, timeLeft]);

  // Vérifier les questions sans réponse
  useEffect(() => {
    if (quizStatus === 'in-progress') {
      const unanswered = selectedOptions
        .map((option, index) => option === null ? index : null)
        .filter(index => index !== null);
      setUnansweredQuestions(unanswered);
    }
  }, [selectedOptions, quizStatus]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleOptionSelect = (questionIndex, optionIndex) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[questionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  const handleSubmitQuiz = async () => {
    // Vérifier si toutes les questions ont été répondues
    const unanswered = selectedOptions.findIndex(option => option === null);
    if (unanswered !== -1) {
      setCurrentQuestion(unanswered);
      toast.error("Veuillez répondre à toutes les questions avant de soumettre le quiz", {
        containerId: "devoirs-toast"
  
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Calculer le score et préparer les réponses
      let score = 0;
      const answersData = [];
      
      quiz.questions.forEach((question, qIndex) => {
        const selectedOptionIndex = selectedOptions[qIndex];
        const selectedOption = selectedOptionIndex !== null ? question.options[selectedOptionIndex] : null;
        const isCorrect = selectedOption && selectedOption.isCorrect || false;
        
        if (isCorrect) {
          score++;
        }
        
        answersData.push({
          questionIndex: qIndex,
          selectedOption: selectedOptionIndex,
          isCorrect: isCorrect,
          question: question.text,
          selectedAnswer: selectedOption ? selectedOption.text : "Pas de réponse",
          correctAnswer: question.options.find(opt => opt.isCorrect).text
        });
      });
      
      const scorePercentage = Math.round((score / quiz.questions.length) * 100);
      
      const quizData = {
        userId: user._id,
        quizId: quiz._id,
        courseId: courseId,
        chapterId: chapterId,
        score: scorePercentage,
        totalQuestions: quiz.questions.length,
        answers: answersData,
        completed: true,
        completedAt: new Date().toISOString()
      };

      const response = await QuizService.saveQuizProgress(quizData, token);

      if (response?.data) {
        setQuizProgress(response.data);
        setQuizComplete(true);
        setQuizStatus('completed');
        toast.success("Quiz terminé avec succès !", {
          containerId: "devoirs-toast"
    
        });
      }
    } catch (err) {
      setError("Erreur lors de la soumission du quiz");
      toast.error("Erreur lors de la soumission du quiz", {
        containerId: "devoirs-toast"
  
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const navigateToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const toggleQuestionDetails = (index) => {
    if (expandedQuestion === index) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(index);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Chargement...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Afficher le résultat si le quiz a déjà été complété
  if (quizStatus === 'completed' || previousAttempt) {
    const attemptData = previousAttempt || quizProgress;
    const userAnswers = attemptData.answers || [];
    const isPassed = attemptData.score >= 70;
    
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Résultat du quiz : {quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-4">{attemptData.score}%</div>
            <div className={`text-xl font-semibold ${isPassed ? 'text-green-600' : 'text-red-600'} mb-2`}>
              {isPassed ? 'Réussi' : 'Échoué'}
            </div>
            <p className="text-gray-600 mb-6">
              Quiz complété le {new Date(attemptData.completedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vos réponses:</h3>

            {userAnswers.map((answer, index) => (
              <div key={index} className="border rounded-md overflow-hidden">
                <div 
                  className={`flex justify-between items-center p-4 cursor-pointer ${answer.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}
                  onClick={() => toggleQuestionDetails(index)}
                >
                  <div className="flex items-center">
                    {answer.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-3" />
                    )}
                    <span className="font-medium">Question {index + 1}</span>
                  </div>
                  {expandedQuestion === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                
                {expandedQuestion === index && (
                  <div className="p-4 bg-white">
                    <p className="font-medium mb-3">{answer.question}</p>
                    
                    <div className="space-y-2 ml-2">
                      <div className="flex items-start">
                        <span className="font-medium mr-2">Votre réponse:</span>
                        <span className={`${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {answer.selectedAnswer}
                        </span>
                      </div>
                      
                      {!answer.isCorrect && (
                        <div className="flex items-start">
                          <span className="font-medium mr-2">Réponse correcte:</span>
                          <span className="text-green-600">{answer.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vue du quiz en attente
  if (quizStatus === 'waiting') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          
          {!isQuizAvailable ? (
            <div className="space-y-4">
              <p className="text-red-500 font-medium">
                Le quiz n'est pas encore disponible
              </p>
              <p className="text-gray-500">
                Le quiz sera disponible le {new Date(quiz.availableFrom).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {timeUntilStart && (
                <p className="text-gray-600">
                  Temps restant avant le début : {timeUntilStart.hours}h {timeUntilStart.minutes}m
                </p>
              )}
              <Button disabled className="opacity-50 cursor-not-allowed">
                Commencer le quiz
              </Button>
            </div>
          ) : (
            <>
            <p className="mb-4">
            Ce quiz contient {quiz.questions.length} questions
          </p>
          <p className="mb-4">
            Temps alloué : {quiz.timeLimit} minutes
          </p>
              <p className="text-gray-500 mb-6">
                Attention : vous n'aurez qu'une seule tentative pour ce quiz et vous devrez répondre à toutes les questions.
              </p>
              <Button onClick={() => {
                setQuizStatus('in-progress');
                setTimeLeft(quiz.timeLimit * 60);
              }}>
                Commencer le quiz
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Vue des questions du quiz
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{quiz.title}</CardTitle>
          <div className="flex items-center text-sm bg-gray-100 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4 mr-1 text-gray-600" />
            <span className={`font-medium ${timeLeft < 60 ? 'text-red-500' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <Progress
          value={((currentQuestion + 1) / quiz.questions.length) * 100}
          className="h-2 mt-4"
        />
      </CardHeader>

      {/* Navigation des questions */}
      <div className="px-6 py-2 bg-gray-50 border-t border-b overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {quiz.questions.map((_, index) => (
            <Badge
              key={index}
              variant={selectedOptions[index] !== null ? "default" : "outline"}
              className={`
                cursor-pointer px-3 py-1
                ${currentQuestion === index ? 'ring-2 ring-primary' : ''}
                ${selectedOptions[index] === null ? 'bg-gray-100 text-gray-700' : 'bg-primary'}
              `}
              onClick={() => navigateToQuestion(index)}
            >
              {index + 1}
            </Badge>
          ))}
        </div>
      </div>

      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Question {currentQuestion + 1}/{quiz.questions.length}</h3>
          {selectedOptions[currentQuestion] === null && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
              <AlertCircle className="h-3 w-3 mr-1" />
              Non répondue
            </Badge>
          )}
        </div>

        <div className="text-lg font-medium">{quiz.questions[currentQuestion].text}</div>

        <RadioGroup
          value={(selectedOptions[currentQuestion]?.toString()) ?? ''}
          onValueChange={(value) => handleOptionSelect(currentQuestion, parseInt(value))}
          className="space-y-3"
        >
          {quiz.questions[currentQuestion].options.map((option, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50"
            >
              <RadioGroupItem
                value={index.toString()}
                id={`option-${index}`}
              />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
          >
            Question précédente
          </Button>
        </div>
        <div className="flex space-x-2">
          {currentQuestion < quiz.questions.length - 1 ? (
            <Button onClick={handleNextQuestion}>
              Question suivante <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitQuiz}
              className="bg-green-600 hover:bg-green-700"
              disabled={unansweredQuestions.length > 0}
            >
              {unansweredQuestions.length > 0 
                ? `${unansweredQuestions.length} question${unansweredQuestions.length > 1 ? 's' : ''} sans réponse`
                : "Terminer le quiz"}
            </Button>
          )}
        </div>
      </CardFooter>

      {unansweredQuestions.length > 0 && currentQuestion === quiz.questions.length - 1 && (
        <div className="px-6 pb-4">
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="ml-2">
              Il vous reste {unansweredQuestions.length} question{unansweredQuestions.length > 1 ? 's' : ''} sans réponse.
              Cliquez sur les numéros de questions pour y répondre.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
};

export default QuizComponent;