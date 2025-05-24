import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlusCircle, FileEdit, Clock, CheckCircle2, AlertCircle, Calendar as CalendarIcon, Trash2, BookOpen } from "lucide-react";
import { useAuth } from "@/pages/auth/authContext";
import AssignmentModal from "@/components/layouts/Assignment/AssignmentModal";
import { fetchCourseAssignments, fetchMySubmission, deleteAssignment } from "@/services/assigmentapi";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/pages/admin/componnents/themcontext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DevoirsPage = () => {
  const { courseDetails, isOwner } = useOutletContext();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const courseId = courseDetails?._id;
  const { token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [tab, setTab] = useState("all");
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const loadAssignments = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCourseAssignments(courseId, token);
        setAssignments(data);
        setFilteredAssignments(data);
      } catch (error) {
        console.error("Erreur:", error.message);
        toast.error("Impossible de charger les devoirs. Veuillez réessayer.", {
          containerId: "devoirs-toast"
  
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignments();
  }, [courseId, token]);

  useEffect(() => {
    if (isOwner || assignments.length === 0 || !user) return;

    const checkSubmissions = async () => {
      const statuses = {};

      for (const assignment of assignments) {
        try {
          const submission = await fetchMySubmission(assignment._id, token);
          statuses[assignment._id] = submission ? submission.status : "not-submitted";
        } catch (error) {
          console.error(`Erreur pour le devoir ${assignment._id}:`, error.message);
          statuses[assignment._id] = "error";
          toast.error(`Erreur lors de la vérification du devoir "${assignment.title}"`, {
            containerId: "devoirs-toast"
    
          });
        }
      }

      setSubmissionStatus(statuses);
    };

    checkSubmissions();
  }, [assignments, isOwner, token, user]);

  useEffect(() => {
    if (!assignments.length) return;

    let filtered = [...assignments];

    if (tab === "upcoming") {
      filtered = filtered.filter(a => new Date(a.dueDate) > new Date());
    } else if (tab === "past") {
      filtered = filtered.filter(a => new Date(a.dueDate) <= new Date());
    }

    if (!isOwner && filter !== "all") {
      filtered = filtered.filter(a => submissionStatus[a._id] === filter);
    }

    setFilteredAssignments(filtered);
  }, [assignments, filter, tab, submissionStatus, isOwner]);

  const getStatusBadge = (assignment) => {
    if (!user || isOwner) {
      const dueDate = new Date(assignment.dueDate);
      const now = new Date();

      if (dueDate < now) {
        return <Badge variant="destructive" className="text-xs font-medium">Terminé</Badge>;
      } else if (dueDate - now < 2 * 24 * 60 * 60 * 1000) {
        return <Badge variant="warning" className="text-xs font-medium">Bientôt</Badge>;
      }
      return null;
    }

    const status = submissionStatus[assignment._id];

    switch (status) {
      case "submitted":
        return <Badge variant="secondary" className="text-xs font-medium">Soumis</Badge>;
      case "late":
        return <Badge variant="warning" className="text-xs font-medium">En retard</Badge>;
      case "graded":
        return <Badge variant="success" className="text-xs font-medium">Noté</Badge>;
      default:
        return <Badge variant="outline" className="text-xs font-medium">À faire</Badge>;
    }
  };

  const handleDeleteClick = (assignment, event) => {
    if (event) {
      event.stopPropagation();
    }
    setAssignmentToDelete(assignment);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;
    
    const assignmentTitle = assignmentToDelete.title;
    const assignmentId = assignmentToDelete._id;
    
    try {
      setIsLoading(true);
      await deleteAssignment(assignmentId, token);
      
      setAssignments(prevAssignments => 
        prevAssignments.filter(a => a._id !== assignmentId)
      );
      setFilteredAssignments(prevFiltered => 
        prevFiltered.filter(a => a._id !== assignmentId)
      );
      
      setIsDeleteDialogOpen(false);
      setAssignmentToDelete(null);
      
      toast.success(`Le devoir "${assignmentTitle}" a été supprimé avec succès.`, {
        containerId: "devoirs-toast"
      });
    } catch (error) {
      console.error("Erreur de suppression:", error.message);
      
      toast.error("Impossible de supprimer le devoir. Veuillez réessayer.", {
        containerId: "devoirs-toast"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCardStatusStyle = (assignment) => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const isOverdue = dueDate < now;
    const isDueSoon = !isOverdue && dueDate - now < 2 * 24 * 60 * 60 * 1000;
    
    // Styles pour l'indicateur de bordure à gauche
    let borderStyle = "";
    if (isOverdue) {
      borderStyle = isDark ? "border-l-4 border-l-red-600" : "border-l-4 border-l-red-500";
    } else if (isDueSoon) {
      borderStyle = isDark ? "border-l-4 border-l-yellow-600" : "border-l-4 border-l-yellow-500";
    } else {
      borderStyle = isDark ? "border-l-4 border-l-green-600" : "border-l-4 border-l-green-500";
    }
    
    // Styles pour l'arrière-plan de la carte
    let bgStyle = "";
    if (isOverdue) {
      
    } else if (isDueSoon) {
      bgStyle = isDark ? "bg-yellow-900/10" : "bg-yellow-50";
    } else {
      bgStyle = isDark ? "bg-gray-800" : "bg-white";
    }
    
    return { borderStyle, bgStyle };
  };

  return (
    <div className={`container mx-auto px-4 py-6 ${isDark ? 'bg-gray-900' : 'bg-white'} min-h-screen transition-colors duration-200`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center">
          <div className={`bg-blue-100 p-3 rounded-full ${isDark ? 'bg-blue-900' : ''} mr-4`}>
            <BookOpen className={`h-6 w-6 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} tracking-tight`}>Devoirs</h1>
            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {isOwner ? "Gérez les devoirs de votre cours" : "Vos travaux à rendre"}
            </p>
          </div>
        </div>

        {isOwner && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 rounded-full px-5 py-2 transition-all shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="h-5 w-5" />
            Créer un devoir
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Tabs value={tab} onValueChange={setTab} className="flex-1">
          <TabsList className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} shadow-sm rounded-full p-1 w-full md:w-auto`}>
            <TabsTrigger 
              value="all" 
              className="rounded-full transition-all data-[state=active]:shadow-md text-sm"
            >
              Tous
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="rounded-full transition-all data-[state=active]:shadow-md text-sm"
            >
              À venir
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="rounded-full transition-all data-[state=active]:shadow-md text-sm"
            >
              Passés
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {!isOwner && (
          <Select onValueChange={setFilter} value={filter}>
            <SelectTrigger className={`w-48 rounded-full ${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-100 border-gray-200'}`}>
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent className={`${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : ''} rounded-lg shadow-lg`}>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="not-submitted">Non soumis</SelectItem>
              <SelectItem value="submitted">Soumis</SelectItem>
              <SelectItem value="late">En retard</SelectItem>
              <SelectItem value="graded">Notés</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-md rounded-xl overflow-hidden`}>
          <CardContent className="py-16 text-center">
            <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
              <CalendarIcon className={`h-10 w-10 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
              {tab === "all"
                ? "Aucun devoir disponible"
                : tab === "upcoming"
                  ? "Aucun devoir à venir"
                  : "Aucun devoir passé"}
            </h3>
            <p className={`mt-1 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {isOwner ? "Créez votre premier devoir en cliquant sur le bouton \"Créer un devoir\"" : "Aucun travail à rendre pour le moment"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => {
            const { borderStyle, bgStyle } = getCardStatusStyle(assignment);
            
            return (
              <Card
                key={assignment._id}
                className={`transition-all hover:shadow-xl ${borderStyle} ${bgStyle} ${
                  isDark
                    ? 'border-gray-700 hover:border-gray-600'
                    : 'hover:border-gray-300'
                } rounded-xl overflow-hidden`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(assignment)}
                      </div>
                      <CardTitle className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {assignment.title}
                      </CardTitle>
                    </div>
                    {isOwner && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentAssignment(assignment);
                            setIsModalOpen(true);
                          }}
                          className={`rounded-full ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteClick(assignment, e)}
                          className={`rounded-full ${
                            isDark
                              ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                              : 'hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardDescription className={`flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                    {format(new Date(assignment.dueDate), "d MMMM yyyy à HH'h'mm", { locale: fr })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className={`line-clamp-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 h-10`}>
                    {assignment.description || "Aucune description fournie"}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center">
                  <Badge 
                    variant={isDark ? 'secondary' : 'outline'} 
                    className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full px-3 py-1`}
                  >
                    {assignment.maxPoints} points
                  </Badge>
                  <Link to={`/home/course/${courseId}/assignments/${assignment._id}`} className="w-auto">
                    <Button 
                      variant={isOwner ? "default" : "outline"} 
                      className={`rounded-full px-4 transition-all ${
                        isOwner 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : isDark 
                            ? 'border-gray-600 hover:bg-gray-700' 
                            : 'border-gray-300 hover:bg-gray-100'
                      }`}
                      size="sm"
                    >
                      {isOwner ? "Voir les soumissions" : "Voir le devoir"}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de création/édition */}
      <AssignmentModal
        isOpen={isModalOpen}
        onClose={(newAssignment) => {
          setIsModalOpen(false);
          setCurrentAssignment(null);

          if (newAssignment) {
            if (currentAssignment) {
              setAssignments(prevAssignments =>
                prevAssignments.map(assignment =>
                  assignment._id === newAssignment._id ? newAssignment : assignment
                )
              );
              toast.success("Devoir mis à jour avec succès ! ", {
                containerId: "devoirs-toast"
        
              });
            } else {
              setAssignments(prevAssignments => [...prevAssignments, newAssignment]);
              toast.success("Devoir créé avec succès ! ", {
                containerId: "devoirs-toast"
        
              });
            }
          }
        }}
        assignment={currentAssignment}
        courseId={courseId}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) setAssignmentToDelete(null);
      }}>
        <AlertDialogContent className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white'} rounded-xl shadow-xl`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Supprimer le devoir
            </AlertDialogTitle>
            <AlertDialogDescription className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Êtes-vous sûr de vouloir supprimer le devoir "{assignmentToDelete?.title}" ?
              <br />
              Cette action est irréversible et supprimera également toutes les soumissions associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className={`rounded-full ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

     
    </div>
  );
};

export default DevoirsPage;