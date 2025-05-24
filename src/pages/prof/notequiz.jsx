import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/pages/auth/authContext";
import QuizService from "@/services/quizchapitreapi";
import { fetchUserById } from "@/services/userapi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, FileText } from "lucide-react";
import { useOutletContext } from "react-router-dom";
const API_URL = `${import.meta.env.VITE_API_URL}`;

// Add this function to your QuizService
const analysePerformanceService = async (studentsResults, quizTitle, courseTitle, chapterTitle, token) => {


  //  console.log("data analyse",quizTitle,courseTitle,chapterTitle);
    
  const response = await fetch(`${API_URL}/quizch/analyse-performances`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      studentsResults,
      quizTitle,
      courseTitle,
      chapterTitle
    })
  });
  console.log("data analy res",response);
  const data = await response.json();
  console.log("data analy res",data);

  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue lors de l\'analyse des performances');
  }
  
  return data.analysis;
};

const NotesQuiz = () => {
  const { token, user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("table");
  const [statsData, setStatsData] = useState([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { courseDetails, isOwner } = useOutletContext();
  const [studentDetails, setStudentDetails] = useState({});

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!courseDetails?._id || !token) {
        setError("Informations du cours manquantes");
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await QuizService.getCourseQuizzes(courseDetails._id, token);
        const allQuizzes = Array.isArray(response) ? response : 
                          Array.isArray(response.data) ? response.data : [];
        
        setQuizzes(allQuizzes);
       // console.log("quizzz note ",response);
        if (allQuizzes.length > 0) {
          setSelectedQuiz(allQuizzes[0]._id);
          
          // Si c'est un étudiant, récupérons toutes ses tentatives pour tous les quiz
          if (!isOwner) {
            const allAttempts = [];
            for (const quiz of allQuizzes) {
              try {
                const quizAttempts = await QuizService.getStudentAttempts(quiz._id, user._id, token);
                const attemptsData = Array.isArray(quizAttempts) ? quizAttempts : 
                                    Array.isArray(quizAttempts.data) ? quizAttempts.data : [];
                allAttempts.push(...attemptsData);
              } catch (err) {
                console.error(`Error fetching attempts for quiz ${quiz._id}:`, err);
              }
            }
            setAttempts(allAttempts);
          } else {
            // Si c'est un prof, on récupère juste les tentatives du premier quiz
            await fetchQuizAttempts(allQuizzes[0]._id);
          }
        }
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError(err.response?.data?.message || "Impossible de récupérer les quiz");
        setQuizzes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [courseDetails._id, token, user._id, isOwner]);

  const fetchStudentDetails = async (studentId) => {
  //  console.log("studentId",studentId);
    if (!studentId || studentDetails[studentId]) return;
    
    try {
      const userData = await fetchUserById(studentId, token);
      setStudentDetails(prev => ({
        ...prev,
        [studentId]: {
          name: userData.name || "Étudiant anonyme",
          email: userData.email || "Email non disponible"
        }
      }));
    } catch (error) {
      console.error("Error fetching student details:", error);
      setStudentDetails(prev => ({
        ...prev,
        [studentId]: {
          name: "Étudiant anonyme",
          email: "Email non disponible"
        }
      }));
    }
  };

  const fetchQuizAttempts = async (quizId) => {
    if (!quizId || !token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await (isOwner 
        ? QuizService.getAllAttempts(quizId, token)
        : QuizService.getStudentAttempts(quizId, user._id, token));
      
      const attemptsData = Array.isArray(response) ? response :
                          Array.isArray(response.data) ? response.data : [];
      
      // Format attempts data to include student information
      const formattedAttempts = attemptsData.map(attempt => ({
        ...attempt,
        studentName: attempt.userId?.name || "Étudiant anonyme",
        studentEmail: attempt.userId?.email || "Email non disponible"
      }));
      
      setAttempts(formattedAttempts);
      setAnalysisResult(null);

      if (isOwner) {
        processStatsData(formattedAttempts);
      }
    } catch (err) {
      console.error("Error fetching attempts:", err);
      setError(err.response?.data?.message || "Impossible de récupérer les tentatives");
      setAttempts([]);
      setStatsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const processStatsData = useMemo(() => (attemptsData) => {
    if (!attemptsData?.length) {
      setStatsData([]);
      return;
    }

    const scoreRanges = {
      "0-20%": 0,
      "21-40%": 0,
      "41-60%": 0,
      "61-80%": 0,
      "81-100%": 0
    };

    attemptsData.forEach(attempt => {
      const score = attempt.score || 0;
      if (score <= 20) scoreRanges["0-20%"]++;
      else if (score <= 40) scoreRanges["21-40%"]++;
      else if (score <= 60) scoreRanges["41-60%"]++;
      else if (score <= 80) scoreRanges["61-80%"]++;
      else scoreRanges["81-100%"]++;
    });

    setStatsData(Object.entries(scoreRanges).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / attemptsData.length) * 100)
    })));
  }, []);

  const handleQuizChange = async (quizId) => {
    setSelectedQuiz(quizId);
    await fetchQuizAttempts(quizId);
  };

  const handleAnalyzePerformance = async () => {
    if (!selectedQuiz || attempts.length === 0) {
      setError("Aucune donnée disponible pour l'analyse");
      return;
    }
    
    const selectedQuizData = quizzes.find(q => q._id === selectedQuiz);
    if (!selectedQuizData) return;
    
    try {
      setAnalysisLoading(true);
      setError(null);
      
      // Format the data for analysis
      const formattedAttempts = attempts.map(attempt => {
        const studentName = attempt.studentName || "Étudiant anonyme";
        const score = attempt.score || 0;
        const totalQuestions = attempt.totalQuestions || 0;
        const correctAnswers = Math.round((score / 100) * totalQuestions);
        
        return {
          studentName,
          score,
          totalQuestions,
          correctAnswers,
          completedAt: attempt.completedAt,
          // Include question-specific data if available
          questions: attempt.answers ? attempt.answers.map(answer => ({
            questionText: answer.questionText || "Question sans texte",
            isCorrect: answer.isCorrect || false,
            studentAnswer: answer.studentAnswer || "Pas de réponse"
          })) : []
        };
      });
      
      const result = await analysePerformanceService(
        formattedAttempts,
        selectedQuizData.title,
        courseDetails?.title || "Cours non spécifié",
        "introduction",
       // courseDetails?.chapters?.find(c => c?.quizzes?.includes(selectedQuiz))?.title || "Chapitre non spécifié",
        token
      );
      
      setAnalysisResult(result);
      setActiveTab("analysis"); // Switch to analysis tab
    } catch (err) {
      console.error("Error analyzing performances:", err);
      setError(err.message || "Impossible d'analyser les performances");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Date invalide";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Chargement des données...
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

  // Vue étudiant
  if (!isOwner) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Mes Notes de Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          {quizzes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Questions correctes</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => {
                    // Rechercher la tentative de l'étudiant pour ce quiz spécifique
                    const attempt = attempts.find(a => a.quizId === quiz._id || a.quizId?._id === quiz._id);
                    
                    return (
                      <TableRow key={quiz._id}>
                        <TableCell className="font-medium">{quiz.title}</TableCell>
                        <TableCell>
                          {attempt ? (
                            <Badge variant="outline" className={getScoreColor(attempt.score)}>
                              {attempt.score}%
                            </Badge>
                          ) : (
                            <span className="text-gray-500">Non complété</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {attempt ? (
                            `${Math.round((attempt.score / 100) * attempt.totalQuestions)} / ${attempt.totalQuestions}`
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {attempt ? formatDate(attempt.completedAt) : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun quiz n'est disponible pour ce cours
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Vue professeur (mise à jour avec l'analyse des performances)
  const selectedQuizTitle = quizzes.find(q => q._id === selectedQuiz)?.title;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Notes des Quiz {selectedQuizTitle ? `- ${selectedQuizTitle}` : ''}</CardTitle>
          <div className="w-full sm:w-64">
            <Select value={selectedQuiz} onValueChange={handleQuizChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un quiz" />
              </SelectTrigger>
              <SelectContent>
                {quizzes.map(quiz => (
                  <SelectItem key={quiz._id} value={quiz._id}>
                    {quiz.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : selectedQuiz ? (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="table">Tableau des notes</TabsTrigger>
                <TabsTrigger value="stats">Statistiques</TabsTrigger>
                <TabsTrigger value="analysis">Analyse IA</TabsTrigger>
              </TabsList>
              
              <TabsContent value="table">
                <div className="flex justify-end mb-4">
                  <Button 
                    onClick={handleAnalyzePerformance} 
                    disabled={analysisLoading || attempts.length === 0}
                    className="gap-2 rounded-full px-5 py-2 transition-all shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700"
                    >
                    {analysisLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Analyser les performances
                  </Button>
                </div>
                
                {attempts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Étudiant</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Questions correctes</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attempts.map((attempt, index) => {
                          const score = attempt.score || 0;
                          const totalQuestions = attempt.totalQuestions || 1;
                          const correctAnswers = Math.round((score / 100) * totalQuestions);
                          
                          return (
                            <TableRow key={attempt._id || index}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{attempt.studentName}</span>
                                  <span className="text-sm text-gray-500">{attempt.studentEmail}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getScoreColor(score)}>
                                  {score}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {correctAnswers} / {totalQuestions}
                              </TableCell>
                              <TableCell>{formatDate(attempt.completedAt)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucune tentative n'a été enregistrée pour ce quiz
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="stats">
                {statsData.length > 0 ? (
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${value} étudiant${value > 1 ? 's' : ''} (${statsData.find(d => d.count === value)?.percentage}%)`,
                            'Nombre d\'étudiants'
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="count" name="Nombre d'étudiants" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucune donnée disponible pour générer des statistiques
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="analysis">
                {analysisLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Analyse des performances en cours...</span>
                  </div>
                ) : analysisResult ? (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                      {analysisResult}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <p>Aucune analyse disponible.</p>
                    <p className="mt-2">Cliquez sur "Analyser les performances" dans l'onglet "Tableau des notes" pour générer une analyse.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {quizzes.length > 0 ? 
              "Sélectionnez un quiz pour voir les résultats" :
              "Aucun quiz n'est disponible pour ce cours"
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesQuiz;