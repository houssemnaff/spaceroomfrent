import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { format, isValid, isPast, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/pages/auth/authContext";
import { ArrowLeft, File, Upload, X, Download, CheckCircle2, Clock, FileText, AlertTriangle } from "lucide-react";
import {
  fetchCourseAssignments,
  fetchMySubmission,
  submitAssignment
} from "@/services/assigmentapi";
import { toast } from "react-toastify";

// Helper function to safely format dates
const formatDate = (dateString, formatStr) => {
  try {
    const date = new Date(dateString);
    if (!isValid(date)) {
      return "Date inconnue";
    }
    return format(date, formatStr, { locale: fr });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date inconnue";
  }
};

// Helper function to check if a date is past
const isDatePast = (dateString) => {
  try {
    const date = parseISO(dateString);
    return isPast(date);
  } catch (error) {
    console.error("Error checking if date is past:", error);
    return false;
  }
};

export const StudentAssignmentView = () => {
  const { assignmentId } = useParams();
  const { courseDetails } = useOutletContext();
  const courseId = courseDetails._id;
  const navigate = useNavigate();
  const { token } = useAuth();

  // Constantes pour la validation des fichiers
  const MAX_FILE_COUNT = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo en octets
  const ALLOWED_FILE_TYPES = /\.(jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|json|csv)$/i;

  const [assignment, setAssignment] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadAssignmentData = async () => {
      try {
        setIsLoading(true);

        // Récupérer les détails du devoir
        const assignments = await fetchCourseAssignments(courseId, token);
        const currentAssignment = assignments.find(a => a._id === assignmentId);

        if (!currentAssignment) {
          throw new Error("Devoir non trouvé");
        }

        setAssignment(currentAssignment);

        // Vérifier si la date limite est passée
        const deadlinePassed = isDatePast(currentAssignment.dueDate);
        setIsDeadlinePassed(deadlinePassed);

        // Récupérer la soumission de l'étudiant
        const mySubData = await fetchMySubmission(assignmentId, token);
        setMySubmission(mySubData);
      } catch (error) {
        console.error(error);
        setError(error.message);
        toast.error(
          "Impossible de charger les données",
          {
            containerId: "devoirs-toast"
          });
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignmentData();
  }, [assignmentId, courseId, token]);

  const validateFile = (file) => {
    // Vérifier l'extension du fichier
    if (!ALLOWED_FILE_TYPES.test(file.name)) {
      const extension = file.name.split('.').pop().toLowerCase();
      return {
        valid: false,
        message: `Type de fichier non supporté: ${extension}. Formats acceptés : jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx, ppt, pptx, zip, json, csv.`
      };
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: `Le fichier ${file.name} dépasse la limite de 5 Mo (taille: ${(file.size / (1024 * 1024)).toFixed(2)} Mo).`
      };
    }

    return { valid: true };
  };

  const handleFileChange = (e) => {
    setFileError("");
    
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Vérification du nombre de fichiers en une seule fois (limite de la requête)
      if (newFiles.length > MAX_FILE_COUNT) {
        const errorMessage = `Maximum ${MAX_FILE_COUNT} fichiers par upload. Vous avez sélectionné ${newFiles.length} fichiers.`;
        setFileError(errorMessage);
        toast.error(`Trop de fichiers sélectionnés ! Maximum ${MAX_FILE_COUNT} fichiers autorisés par requête.`, {
          containerId: "devoirs-toast"
        });
        e.target.value = ''; // Réinitialise l'input
        return;
      }

      // Vérifier que le total des fichiers ne dépasse pas la limite
      const totalFiles = submissionFiles.length + newFiles.length;
      if (totalFiles > MAX_FILE_COUNT) {
        const errorMessage = `Vous ne pouvez pas avoir plus de ${MAX_FILE_COUNT} fichiers au total. Actuellement: ${submissionFiles.length}, tentative d'ajout: ${newFiles.length}`;
        setFileError(errorMessage);
        toast.error(errorMessage, {
          containerId: "devoirs-toast"
        });
        e.target.value = '';
        return;
      }

      let validFiles = [];
      
      for (const file of newFiles) {
        const validation = validateFile(file);
        
        if (validation.valid) {
          validFiles.push(file);
        } else {
          setFileError(validation.message);
          toast.error(validation.message, {
            containerId: "devoirs-toast"
          });
          e.target.value = ''; // Réinitialise l'input
          return;
        }
      }
      
      if (validFiles.length > 0) {
        setSubmissionFiles([...submissionFiles, ...validFiles]);
        toast.success(`${validFiles.length} fichier(s) ajouté(s) avec succès.`, {
          containerId: "devoirs-toast"
        });
      }
      
      e.target.value = ''; // Réinitialise l'input pour permettre la sélection du même fichier
    }
  };

  const removeFile = (index) => {
    setSubmissionFiles(submissionFiles.filter((_, i) => i !== index));
    setFileError(""); // Effacer l'erreur quand on supprime un fichier
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Vérifier à nouveau si la date limite est passée (double vérification)
    if (isDatePast(assignment.dueDate)) {
      setError("La date limite de ce devoir est passée. Vous ne pouvez plus soumettre de travail.");
      setIsSubmitting(false);
      return;
    }

    // Vérifier qu'il y a du contenu ou des fichiers
    if (!submissionContent.trim() && submissionFiles.length === 0) {
      setError("Veuillez saisir du contenu ou ajouter des fichiers avant de soumettre.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = {
        courseId,
        assignmentId,
        content: submissionContent,
        attachments: submissionFiles
      };

      const response = await submitAssignment(formData, token);

      const updatedSubmission = await fetchMySubmission(assignmentId, token);

      // Mettre à jour l'état local avec la nouvelle soumission
      setMySubmission(updatedSubmission);
      setSubmissionContent("");
      setSubmissionFiles([]);
      setFileError("");

      // Afficher un toast de succès
      toast.success(
        "Votre travail a été soumis avec succès",
        {
          containerId: "devoirs-toast"
        });

      // Changer d'onglet
      setActiveTab("mySubmission");
    } catch (error) {
      setError(error.message);
      toast.error(
        "Une erreur est survenue lors de la soumission",
        {
          containerId: "devoirs-toast"
        });
    } finally {
      setIsSubmitting(false);
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
                {assignment.maxPoints} points • Date limite: {formatDate(assignment.dueDate, "d MMMM yyyy à HH'h'mm")}
                {isDeadlinePassed && (
                  <span className="text-red-500 ml-2 font-medium">
                    (Date limite dépassée)
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const htmlContent = `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <title>${assignment.title}</title>
                    <style>
                      body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                      h1 { color: #2c3e50; }
                      .meta { color: #7f8c8d; margin-bottom: 20px; }
                    </style>
                  </head>
                  <body>
                    <h1>${assignment.title}</h1>
                    <div class="meta">
                      Points: ${assignment.maxPoints} • Date limite: ${formatDate(assignment.dueDate, "d MMMM yyyy à HH'h'mm")}
                    </div>
                    <div>${assignment.description.replace(/\n/g, '<br/>')}</div>
                  </body>
                  </html>
                `;
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${assignment.title.replace(/\s+/g, '_')}_description.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Télécharger la description
            </Button>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="submit" disabled={!!mySubmission || isDeadlinePassed}>Soumettre</TabsTrigger>
          <TabsTrigger value="mySubmission" disabled={!mySubmission}>Ma soumission</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <div className="space-y-4">
            {isDeadlinePassed && !mySubmission && (
              <Card>
                <CardContent className="p-6">
                  <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4 flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Date limite dépassée</p>
                      <p>La date limite de soumission pour ce devoir est passée. Vous ne pouvez plus soumettre votre travail.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!mySubmission && !isDeadlinePassed && (
              <Card>
                <CardContent className="p-6">
                  <div className="bg-blue-50 p-4 rounded-md text-blue-700 mb-4">
                    <p>Vous n'avez pas encore soumis votre travail pour ce devoir.</p>
                  </div>
                  <Button onClick={() => setActiveTab("submit")}>Soumettre mon travail</Button>
                </CardContent>
              </Card>
            )}

            {mySubmission && (
              <Card>
                <CardContent className="p-6">
                  <div className="bg-green-50 p-4 rounded-md text-green-700 mb-4 flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">Vous avez soumis votre travail</p>
                      <p className="text-sm">
                        Soumis le {formatDate(mySubmission.submittedAt, "d MMMM yyyy à HH'h'mm")}
                        {mySubmission.status === "late" && " (en retard)"}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setActiveTab("mySubmission")}>Voir ma soumission</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="submit" className="mt-4">
          {isDeadlinePassed ? (
            <Card>
              <CardContent className="p-6">
                <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4 flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Date limite dépassée</p>
                    <p>La date limite de soumission pour ce devoir est passée. Vous ne pouvez plus soumettre votre travail.</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setActiveTab("details")}>
                  Retour aux détails
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Soumettre mon travail</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="submissionContent">Contenu de la soumission</Label>
                    <Textarea
                      id="submissionContent"
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      rows={8}
                      placeholder="Saisissez votre réponse ici..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="block mb-2">Pièces jointes</Label>
                    
                    {/* Informations sur les contraintes */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                      <p><strong>Formats autorisés:</strong> jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx, ppt, pptx, zip, json, csv</p>
                      <p><strong>Taille max:</strong> 5 Mo par fichier</p>
                      <p><strong>Limite:</strong> Maximum {MAX_FILE_COUNT} fichiers au total</p>
                    </div>

                    {/* Zone de upload */}
                    <div 
                      className="border-2 border-dashed border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300 transition-colors mb-4"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Cliquez pour ajouter des fichiers</span>
                          <br />
                          <span className="text-xs">ou glissez vos fichiers ici</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          ({submissionFiles.length}/{MAX_FILE_COUNT} fichiers)
                        </p>
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      multiple
                      accept=".jpeg,.jpg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.json,.csv"
                    />

                    {/* Affichage des erreurs de fichier */}
                    {fileError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-start">
                        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{fileError}</span>
                      </div>
                    )}

                    {/* Liste des fichiers sélectionnés */}
                    {submissionFiles.length > 0 && (
                      <div className="space-y-2 mt-4 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Fichiers sélectionnés ({submissionFiles.length}/{MAX_FILE_COUNT})
                        </p>
                        {submissionFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded-md border">
                            <div className="flex items-center min-w-0 flex-1 gap-2">
                              <File className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="text-sm font-medium truncate block">{file.name}</span>
                                <span className="text-xs text-gray-500">
                                  {(file.size / (1024 * 1024)).toFixed(2)} Mo
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-100 flex-shrink-0"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 p-4 rounded-md text-red-700 flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("details")}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || isDeadlinePassed}
                    >
                      {isSubmitting ? "Envoi en cours..." : "Soumettre mon travail"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mySubmission" className="mt-4">
          {mySubmission && (
            <Card>
              <CardHeader className="bg-gray-50">
                <div className="flex justify-between items-center">
                  <CardTitle>Ma soumission</CardTitle>
                  <div className="flex items-center space-x-2">
                    {mySubmission.status === "late" ? (
                      <span className="text-orange-500 text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> Soumis en retard
                      </span>
                    ) : mySubmission.status === "graded" ? (
                      <span className="text-green-500 text-sm flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Noté: {mySubmission.grade}/{assignment.maxPoints}
                      </span>
                    ) : (
                      <span className="text-blue-500 text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> Soumis à temps
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Soumis le {formatDate(mySubmission.submittedAt, "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Contenu de ma soumission</h4>
                  <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                    {mySubmission.content || "(Pas de contenu texte)"}
                  </div>
                </div>

                {mySubmission.attachments && mySubmission.attachments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Pièces jointes ({mySubmission.attachments.length})</h4>
                    <div className="space-y-2">
                      {mySubmission.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mySubmission.status === "graded" && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-2">Retour du professeur</h4>
                    <div className="mb-2">
                      <span className="font-semibold">Note: </span>
                      <span>{mySubmission.grade}/{assignment.maxPoints}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Commentaire: </span>
                      <div className="p-4 bg-gray-50 rounded-md mt-2 whitespace-pre-wrap">
                        {mySubmission.feedback || "(Pas de commentaire)"}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};