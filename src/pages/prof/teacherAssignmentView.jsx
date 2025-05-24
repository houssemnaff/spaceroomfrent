import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/pages/auth/authContext";
import { ArrowLeft, File, Download, CheckCircle2, Clock } from "lucide-react";
import {
  fetchCourseAssignments,
  fetchAssignmentSubmissions,
  gradeSubmission
} from "@/services/assigmentapi";
import { toast } from "react-toastify";

export const TeacherAssignmentView = () => {
  const { assignmentId } = useParams();
  const { courseDetails } = useOutletContext();
  const courseId = courseDetails._id;
  const navigate = useNavigate();
  const { token } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [gradeData, setGradeData] = useState({});

  useEffect(() => {
    const loadAssignmentData = async () => {
      try {
        setIsLoading(true);

        const assignments = await fetchCourseAssignments(courseId, token);
        const currentAssignment = assignments.find(a => a._id === assignmentId);

        if (!currentAssignment) {
          throw new Error("Devoir non trouvé");
        }

        setAssignment(currentAssignment);

        const submissionsData = await fetchAssignmentSubmissions(assignmentId, token);
        setSubmissions(submissionsData);

        const gradeState = {};
        submissionsData.forEach(sub => {
          gradeState[sub._id] = {
            grade: sub.grade || "",
            feedback: sub.feedback || ""
          };
        });
        setGradeData(gradeState);
      } catch (error) {
        console.error(error);
        setError(error.message);
        toast.error("Impossible de charger les données du devoir. Veuillez réessayer.", {
          containerId: "devoirs-toast"
  
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignmentData();
  }, [assignmentId, courseId, token]);

  const handleGradeChange = (submissionId, field, value) => {
    setGradeData(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value
      }
    }));
  };

  const handleSubmitGrade = async (submissionId) => {
    try {
      const data = {
        grade: parseFloat(gradeData[submissionId].grade),
        feedback: gradeData[submissionId].feedback
      };

      await gradeSubmission(submissionId, data, token);

      setSubmissions(submissions.map(sub => {
        if (sub._id === submissionId) {
          return {
            ...sub,
            grade: data.grade,
            feedback: data.feedback,
            status: "graded"
          };
        }
        return sub;
      }));

      toast.success("Note enregistrée avec succès ! ", {
        containerId: "devoirs-toast"

      });
    } catch (error) {
      console.error(error);
      toast.error( "Impossible d'enregistrer la note. Veuillez réessayer.", {
        containerId: "devoirs-toast"

      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-500">{error || "Ce devoir n'existe pas"}</p>
        <Button variant="outline" onClick={() => navigate(`/home/course/${courseId}/devoirs`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux devoirs
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" className="mb-6" onClick={() => navigate(`/home/course/${courseId}/devoirs`)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux devoirs
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl">{assignment.title}</h1>
              <p className="text-sm text-gray-500">
                {assignment.maxPoints} points • Date limite: {format(new Date(assignment.dueDate), "d MMMM yyyy à HH'h'mm", { locale: fr })}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div dangerouslySetInnerHTML={{ __html: assignment.description.replace(/\n/g, '<br/>') }} />

          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Pièces jointes du professeur</h3>
              <div className="space-y-2">
              {assignment.attachments.map((file, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                    <File className="h-4 w-4 mr-2 text-blue-500" />

                    {/* Ouvrir dans un nouvel onglet en cliquant sur le nom */}
                    <button
                      onClick={() => window.open(file.path, '_blank')}
                      className="text-sm text-left text-blue-600 hover:underline focus:outline-none"
                    >
                      {file.filename}
                    </button>


                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Soumissions des étudiants ({submissions.length})</h2>
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Aucun étudiant n'a encore soumis de travail.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission._id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{submission.studentId.name}</h3>
                      <p className="text-sm text-gray-500">{submission.studentId.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {submission.status === "late" ? (
                        <span className="text-orange-500 text-sm flex items-center">
                          <Clock className="h-4 w-4 mr-1" /> Soumis en retard
                        </span>
                      ) : submission.status === "graded" ? (
                        <span className="text-green-500 text-sm flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Noté: {submission.grade}/{assignment.maxPoints}
                        </span>
                      ) : (
                        <span className="text-blue-500 text-sm flex items-center">
                          <Clock className="h-4 w-4 mr-1" /> Soumis à temps
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {format(new Date(submission.submittedAt), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Contenu de la soumission</h4>
                    <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                      {submission.content || "(Pas de contenu texte)"}
                    </div>
                  </div>

                  {submission.attachments && submission.attachments.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Pièces jointes</h4>
                      <div className="space-y-2">
                        {submission.attachments.map((file, index) => (
                          <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                          <File className="h-4 w-4 mr-2 text-blue-500" />
      
                          {/* Ouvrir dans un nouvel onglet en cliquant sur le nom */}
                          <button
                            onClick={() => window.open(file.path, '_blank')}
                            className="text-sm text-left text-blue-600 hover:underline focus:outline-none"
                          >
                            {file.filename}
                          </button>
      
      
                        </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-2">Notation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`grade-${submission._id}`}>Note (sur {assignment.maxPoints})</Label>
                        <Input
                          id={`grade-${submission._id}`}
                          type="number"
                          min="0"
                          max={assignment.maxPoints}
                          value={gradeData[submission._id]?.grade || ""}
                          onChange={(e) => {
                            const value = e.target.value;

                            // Validation immédiate
                            if (value !== "" && (parseFloat(value) < 0 || parseFloat(value) > assignment.maxPoints)) {
                              toast.info(`La note doit être entre 0 et ${assignment.maxPoints}`, {
                                containerId: "devoirs-toast"
                        
                              });
                              return;
                            }

                            handleGradeChange(submission._id, "grade", value);
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`feedback-${submission._id}`}>Commentaire</Label>
                        <Textarea
                          id={`feedback-${submission._id}`}
                          value={gradeData[submission._id]?.feedback || ""}
                          onChange={(e) => handleGradeChange(submission._id, "feedback", e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSubmitGrade(submission._id)}
                      disabled={!gradeData[submission._id]?.grade}
                    >
                      Enregistrer la note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

     
    </div>
  );
};

