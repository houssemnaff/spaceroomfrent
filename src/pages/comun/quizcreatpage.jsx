/*import React, { useState, useEffect } from "react";
import { useAuth } from "@/pages/auth/authContext";
import { Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import QuizOwnerView from "../prof/quizownerview";
import QuizParticipantView from "../etudiant/quizstudentview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getQuiz } from "@/services/quizapi";

const QuizDetailPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId || !token) return;

      try {
        setLoading(true);
        const data = await getQuiz(quizId, token); // Utilise le service axios
        setQuiz(data.quiz);
        setQuestions(data.questions || []);
        console.log("quiz owner ",data.quiz.owner);
        console.log("user id quiz ",user._id);

        setIsOwner(data.quiz.owner === user._id);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError(err.message || "An error occurred while loading the quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId, token, user]);

  if (loading) {
    return (
      <Card className="flex items-center justify-center p-12">
        <CardContent className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg">Loading quiz...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <CardContent className="flex flex-col items-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  if (!quiz) return null;
     
  return (
    <div className="container mx-auto py-6">
      {isOwner ? (
        <QuizOwnerView quiz={quiz} questions={questions} />
      ) : (
        <QuizParticipantView quiz={quiz} questions={questions} />
      )}
    </div>
  );
};

export default QuizDetailPage;*/
