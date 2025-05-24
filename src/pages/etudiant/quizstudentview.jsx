

import React, { useState, useEffect } from "react";
import { useAuth } from "@/pages/auth/authContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  startQuiz as startQuizApi,
  submitQuizAnswers,
  getQuizResults
} from "../../services/quizapi"; // Adjust the import path as needed

const QuizParticipantView = ({ quiz, questions: initialQuestions }) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [error, setError] = useState(null);
// Start quiz
const handleStartQuiz = async () => {
    try {
      setLoading(true);
      const submissionData = await startQuizApi(quiz._id, token);
      
      console.log("Quiz start response:", submissionData);
      
      // Set the active submission
      setActiveSubmission(submissionData);
      
      // Since the API doesn't return questions, we'll use the initialQuestions prop
      setQuestions(initialQuestions || []);
      
      // Initialize answers object
      const initialAnswers = {};
      initialQuestions?.forEach(q => {
        initialAnswers[q._id] = q.questionType === "multipleChoice" ? [] : "";
      });
      setAnswers(initialAnswers);
      
      // Set timer if there's a time limit
      if (quiz.timeLimit && submissionData?.startedAt) {
        const endTime = new Date(submissionData.startedAt);
        endTime.setMinutes(endTime.getMinutes() + quiz.timeLimit);
        const remainingMs = endTime - new Date();
        setTimeRemaining(remainingMs > 0 ? remainingMs : 0);
      }
    } catch (err) {
      console.error("Error starting quiz:", err);
      setError(err.message || "Failed to start quiz");
    } finally {
      setLoading(false);
    }
  };

  // Handle answer selection
  const handleAnswerChange = (questionId, value, questionType) => {
    if (questionType === "multipleChoice") {
      setAnswers(prev => {
        const currentAnswers = [...(prev[questionId] || [])];
        const valueIndex = currentAnswers.indexOf(value);
        
        if (valueIndex === -1) {
          currentAnswers.push(value);
        } else {
          currentAnswers.splice(valueIndex, 1);
        }
        
        return { ...prev, [questionId]: currentAnswers };
      });
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
    }
  };

  // Navigate between questions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (!window.confirm("Are you sure you want to submit your quiz?")) return;
    
    try {
      setLoading(true);
      
      // Format answers for submission
      const formattedAnswers = Object.keys(answers).map(questionId => ({
        questionId,
        answer: answers[questionId]
      }));
      
      const data = await submitQuizAnswers(quiz._id, formattedAnswers, token);
      
      setQuizCompleted(true);
      setQuizResults(data);
      
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError(err.message || "Failed to submit quiz");
    } finally {
      setLoading(false);
    }
  };

  // Fetch quiz results if needed
  const fetchQuizResults = async () => {
    try {
      const results = await getQuizResults(quiz._id, token);
      setQuizResults(results);
      setQuizCompleted(true);
    } catch (err) {
      console.error("Error fetching quiz results:", err);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!timeRemaining) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Format remaining time
  const formatTime = (ms) => {
    if (!ms) return "No time limit";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Render quiz results
  if (quizCompleted && quizResults) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Quiz Results</CardTitle>
            <CardDescription>
              {quizResults.score >= 70 ? (
                <span className="text-green-600 font-medium">
                  Congratulations on completing the quiz!
                </span>
              ) : (
                <span className="text-orange-600 font-medium">
                  You've completed the quiz. Review your answers below.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold">
                  {Math.round(quizResults.score)}%
                </div>
                <div className="text-sm text-gray-500">
                  {quizResults.totalPoints} / {quizResults.maxPoints} points
                </div>
                <Progress 
                  value={quizResults.score} 
                  className="w-full h-2 my-4" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <div className="text-sm text-gray-500">Started at</div>
                  <div>{new Date(quizResults.startedAt).toLocaleString()}</div>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <div className="text-sm text-gray-500">Completed at</div>
                  <div>{new Date(quizResults.completedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
            <Button onClick={() => {
              setQuizCompleted(false);
              setCurrentQuestionIndex(0);
              setQuizResults(null);
            }}>
              Review Answers
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Answer Review</h2>
          {questions.map((question, index) => {
            const answer = quizResults.answers.find(a => a.questionId === question._id);
            return (
              <Card key={question._id} className={`overflow-hidden border-l-4 ${
                answer?.isCorrect ? "border-l-green-500" : "border-l-red-500"
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">
                      Question {index + 1}
                      {answer?.isCorrect ? (
                        <CheckCircle className="inline ml-2 text-green-500 h-5 w-5" />
                      ) : (
                        <XCircle className="inline ml-2 text-red-500 h-5 w-5" />
                      )}
                    </CardTitle>
                    <div className="text-sm">
                      {answer?.points || 0}/{question.points} points
                    </div>
                  </div>
                  <CardDescription className="font-medium text-base text-black">
                    {question.questionText}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {question.questionType === "multipleChoice" && (
                    <ul className="space-y-2">
                      {question.options.map(option => {
                        const isSelected = Array.isArray(answer?.answer) && 
                          answer?.answer.includes(option._id);
                        const isCorrect = option.isCorrect;
                        
                        return (
                          <li 
                            key={option._id}
                            className={`p-2 rounded-md ${
                              isSelected && isCorrect ? "bg-green-100" :
                              isSelected && !isCorrect ? "bg-red-100" :
                              !isSelected && isCorrect ? "bg-green-50 border border-green-300" :
                              "bg-gray-50"
                            }`}
                          >
                            {option.text}
                            {isCorrect && <CheckCircle className="inline ml-2 text-green-500 h-4 w-4" />}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {question.questionType === "trueFalse" && (
                    <div className="space-y-2">
                      <div className={`p-2 rounded-md ${
                        answer?.answer === "true" && question.correctAnswer === "true" ? "bg-green-100" :
                        answer?.answer === "true" && question.correctAnswer !== "true" ? "bg-red-100" :
                        "bg-gray-50"
                      }`}>
                        True
                        {question.correctAnswer === "true" && <CheckCircle className="inline ml-2 text-green-500 h-4 w-4" />}
                      </div>
                      <div className={`p-2 rounded-md ${
                        answer?.answer === "false" && question.correctAnswer === "false" ? "bg-green-100" :
                        answer?.answer === "false" && question.correctAnswer !== "false" ? "bg-red-100" :
                        "bg-gray-50"
                      }`}>
                        False
                        {question.correctAnswer === "false" && <CheckCircle className="inline ml-2 text-green-500 h-4 w-4" />}
                      </div>
                    </div>
                  )}
                  {question.questionType === "shortAnswer" && (
                    <div className="space-y-2">
                      <div className="p-2 rounded-md bg-gray-50">
                        <div className="text-sm font-medium">Your answer:</div>
                        <div>{answer?.answer || "No answer provided"}</div>
                      </div>
                      <div className="p-2 rounded-md bg-green-50">
                        <div className="text-sm font-medium">Correct answer:</div>
                        <div>{question.correctAnswer}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Render active quiz
  if (activeSubmission) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          {timeRemaining !== null && (
            <div className="flex items-center bg-blue-50 text-blue-800 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4 mr-2" />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between text-sm text-gray-500">
          <div>Question {currentQuestionIndex + 1} of {questions.length}</div>
          <div>{currentQuestion?.points || 1} point{currentQuestion?.points !== 1 ? 's' : ''}</div>
        </div>
        
        <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="h-2" />
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion?.questionText}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion?.questionType === "multipleChoice" && (
              <div className="space-y-2">
                {currentQuestion.options.map(option => (
                  <div 
                    key={option._id}
                    className={`p-3 border rounded-md cursor-pointer ${
                      answers[currentQuestion._id]?.includes(option._id) 
                        ? "bg-blue-50 border-blue-300" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleAnswerChange(currentQuestion._id, option._id, "multipleChoice")}
                  >
                    {option.text}
                  </div>
                ))}
              </div>
            )}
            
            {currentQuestion?.questionType === "trueFalse" && (
              <div className="space-y-2">
                <div 
                  className={`p-3 border rounded-md cursor-pointer ${
                    answers[currentQuestion._id] === "true" 
                      ? "bg-blue-50 border-blue-300" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleAnswerChange(currentQuestion._id, "true", "trueFalse")}
                >
                  True
                </div>
                <div 
                  className={`p-3 border rounded-md cursor-pointer ${
                    answers[currentQuestion._id] === "false" 
                      ? "bg-blue-50 border-blue-300" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleAnswerChange(currentQuestion._id, "false", "trueFalse")}
                >
                  False
                </div>
              </div>
            )}
            
            {currentQuestion?.questionType === "shortAnswer" && (
              <textarea
                className="w-full p-3 border rounded-md h-32"
                placeholder="Type your answer here..."
                value={answers[currentQuestion._id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value, "shortAnswer")}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={goToPrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <Button onClick={goToNextQuestion}>Next</Button>
            ) : (
              <Button onClick={handleSubmitQuiz}>Submit Quiz</Button>
            )}
          </CardFooter>
        </Card>
        
        <div className="flex justify-center mt-4">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 mx-1 rounded-full cursor-pointer ${
                index === currentQuestionIndex 
                  ? "bg-primary" 
                  : answers[questions[index]?._id] 
                    ? "bg-gray-400" 
                    : "bg-gray-200"
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Render quiz start screen
  return (
    <Card className="max-w-2xl mx-auto my-16">
      <CardHeader>
        <CardTitle className="text-2xl">{quiz.title}</CardTitle>
        <CardDescription>{quiz.description || "No description available"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Quiz Information</h3>
          <ul className="space-y-2">
            <li className="flex">
              <span className="font-medium w-32">Time Limit:</span>
              <span>{quiz.timeLimit ? `${quiz.timeLimit} minutes` : "No time limit"}</span>
            </li>
            <li className="flex">
              <span className="font-medium w-32">Questions:</span>
              <span>{initialQuestions.length} questions</span>
            </li>
            <li className="flex">
              <span className="font-medium w-32">Passing Score:</span>
              <span>{quiz.passingScore || 70}%</span>
            </li>
            <li className="flex">
              <span className="font-medium w-32">Attempts:</span>
              <span>{quiz.maxAttempts ? `${quiz.maxAttempts} attempts allowed` : "Unlimited attempts"}</span>
            </li>
          </ul>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
        <Button onClick={handleStartQuiz} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading
            </>
          ) : (
            "Start Quiz"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizParticipantView;


