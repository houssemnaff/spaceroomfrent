import React, { useState, useEffect } from "react";
import { useAuth } from "@/pages/auth/authContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Save, Trash2, Users } from "lucide-react";
import QuestionsList from "../../components/layouts/quiz/QuestionsList";
import QuestionForm from "../../components/layouts/quiz/QuestionForm";
import ParticipantsList from "../../components/layouts/quiz/ParticipantsList";
import QuizSettings from "../../components/layouts/quiz/QuizSettings";
import { useRoutes } from "react-router-dom";
import QuestionCreationForm from "@/components/layouts/quiz/questionquizform";

const QuizOwnerView = ({ quiz, questions: initialQuestions }) => {
 // const router = useRoutes();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [editingQuiz, setEditingQuiz] = useState(false);
  const [quizData, setQuizData] = useState(quiz);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch submissions data
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/quiz/${quiz._id}/submissions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "participants") {
      fetchSubmissions();
    }
  }, [activeTab, quiz._id, token]);

  // Handle quiz update
  const handleQuizUpdate = async (updatedQuizData) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/quiz/${quiz._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedQuizData),
      });

      if (response.ok) {
        const updatedQuiz = await response.json();
        setQuizData(updatedQuiz);
        setEditingQuiz(false);
      }
    } catch (error) {
      console.error("Error updating quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add new question
const handleAddQuestion = async (questionData) => {
    console.log("dat quest&",questionData);
    try {
      setLoading(true);
      
      // S'assurer que toutes les données nécessaires sont présentes
      const completeQuestionData = {
        questionText: questionData.questionText,  // Changed from text to questionText
        questionType: questionData.questionType,
        options: questionData.options || [],
        correctAnswer: questionData.correctAnswer,
        points: Number(questionData.points) || 1 // Valeur par défaut si non fournie
      };
      console.log("dat quest2",questionData);

      const response = await fetch(`http://localhost:5000/quiz/${quiz._id}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(completeQuestionData),
      });
  
      if (response.ok) {
        const newQuestion = await response.json();
        setQuestions([...questions, newQuestion]);
        setAddingQuestion(false);
      } else {
        const errorData = await response.json();
        console.error("Error adding question:", errorData.message);
      }
    } catch (error) {
      console.error("Error adding question:", error);
    } finally {
      setLoading(false);
    }
  };
  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/quiz/${quiz._id}/questions/${questionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setQuestions(questions.filter((q) => q._id !== questionId));
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async () => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/quiz/${quiz._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
       // router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{quizData.title}</h1>
          <p className="text-gray-500">{quizData.description || "No description"}</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setEditingQuiz(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Quiz
          </Button>
          <Button variant="destructive" onClick={handleDeleteQuiz}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Quiz
          </Button>
        </div>
      </div>

      {editingQuiz && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizSettings
              quizData={quizData}
              onSave={handleQuizUpdate}
              onCancel={() => setEditingQuiz(false)}
            />
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
          <TabsTrigger value="participants">
            <Users className="h-4 w-4 mr-2" />
            Participants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm">
                    {quizData.isPublished ? (
                      <span className="text-green-600 font-medium">Published</span>
                    ) : (
                      <span className="text-orange-600 font-medium">Draft</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Time Limit</p>
                  <p className="text-sm">
                    {quizData.timeLimit ? `${quizData.timeLimit} minutes` : "No time limit"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created On</p>
                  <p className="text-sm">{formatDate(quizData.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Access Key</p>
                  <p className="text-sm">{quizData.accessKey || "No access key"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Questions</p>
                  <p className="text-sm">{questions.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Points</p>
                  <p className="text-sm">
                    {questions.reduce((total, q) => total + (q.points || 1), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <Button onClick={() => setAddingQuestion(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {addingQuestion ? (
            <Card>
              <CardHeader>
                <CardTitle>New Question</CardTitle>
              </CardHeader>
              <CardContent>
              <QuestionCreationForm
          onSave={(data) => handleAddQuestion(data)}
          onCancel={() => setAddingQuestion(false)}
        />
              </CardContent>
            </Card>
          ) : (
            <QuestionsList
              questions={questions}
              onEdit={(questionId) => console.log("Edit question", questionId)}
              onDelete={handleDeleteQuestion}
            />
          )}
        </TabsContent>

        <TabsContent value="participants" className="mt-6">
          <ParticipantsList submissions={submissions} quizId={quiz._id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizOwnerView;