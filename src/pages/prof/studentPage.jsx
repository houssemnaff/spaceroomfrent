import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useAuth } from "@/pages/auth/authContext";
import { fetchCourseStudents, removeStudentFromCourse, inviteStudentToCourse } from "@/services/coursapi";
import { fetchCourseProgress } from "@/services/progressApi";
import { Trash2, Search, UserPlus, Crown, BookOpen, CheckCircle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-toastify";

const StudentList = () => {
  const { courseDetails, isOwner } = useOutletContext();
  const courseId = courseDetails?._id;
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentProgress, setStudentProgress] = useState({});
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  
  // Invitation dialog state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // État pour le dialogue de confirmation de suppression d'étudiant
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Set up responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!courseId) return;
    
    const loadStudents = async () => {
      setIsLoading(true);
      try {
        const studentData = await fetchCourseStudents(courseId, token);
        // Ajouter le propriétaire du cours comme professeur
        const teacher = {
          ...courseDetails.owner,
          isTeacher: true
        };
        setStudents([teacher, ...studentData]);
        setFilteredStudents([teacher, ...studentData]);

        // Charger la progression pour chaque étudiant (si owner)
        if (isOwner) {
          const progressData = {};
          for (const student of studentData) {
            try {
              const progress = await fetchCourseProgress(student._id, courseId, token);
              progressData[student._id] = progress.progress;
            //  console.log("progresss", progressData[student._id]);
            } catch (error) {
              console.error(`Error loading progress for student ${student._id}:`, error);
              progressData[student._id] = null;
            }
          }
          setStudentProgress(progressData);
         // console.log("progeres ",progressData);
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStudents();
  }, [courseId, token, isOwner]);

  // Handle search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        student => 
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const handleRemoveStudent = (student) => {
    if (!isOwner) {
      toast.error("Vous devez être le propriétaire du cours pour supprimer un étudiant.", {
        containerId: "devoirs-toast"

      });
     
      return;
    }
    
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    setIsDeleting(true);
    try {
      await removeStudentFromCourse(courseId, studentToDelete._id, token);
      toast.success(`L'étudiant ${studentToDelete.name} a été supprimé du cours avec succès`, {
        containerId: "devoirs-toast"
      });
      setStudents(students.filter((student) => student._id !== studentToDelete._id));
      // Mettre à jour aussi les données de progression
      const newProgress = {...studentProgress};
      delete newProgress[studentToDelete._id];
      setStudentProgress(newProgress);
    } catch (error) {
      console.error(error.message);
      toast.error("Impossible de supprimer l'étudiant.", {
        containerId: "devoirs-toast"

      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };
  
  const handleSendInvitation = async () => {
    if (!inviteEmail.trim() || !courseId) {
      setInviteError("Veuillez saisir une adresse email.");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setInviteError("Veuillez saisir une adresse email valide.");
      return;
    }
    
    setInviteError("");
    setIsSending(true);
    try {
      await inviteStudentToCourse(courseId, inviteEmail, token);
      toast.success("Invitation envoyée avec succès!", {
        containerId: "devoirs-toast"

      });
      setInviteEmail("");
      setIsInviteOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'invitation:", error);
      toast.error("Erreur lors de l'envoi de l'invitation:", {
        containerId: "devoirs-toast"

      });
      setInviteError(error.message || "Impossible d'envoyer l'invitation. Veuillez réessayer.");
    } finally {
      setIsSending(false);
    }
  };

  const renderProgressStats = (studentId) => {
    const progress = studentProgress[studentId];
    if (!progress) return null;

    return (
      <div className="mt-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Progression globale</span>
          <span className="text-xs font-medium">{progress.progressPercentage.toFixed(0)}%</span>
        </div>
        <Progress value={progress.progressPercentage} className="h-2" />
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-blue-500" />
            <span>{progress.viewedResources}/{progress.totalResources} ressources</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>{progress.completedAssignments}/{progress.totalAssignments} devoirs</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3 text-purple-500" />
            <span>{progress.completedQuizzes}/{progress.totalQuizzes} quiz</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg font-medium">Participants du cours</span>
            <span className="text-sm text-gray-500 font-normal">({filteredStudents.length})</span>
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-8 w-full"
                placeholder="Rechercher un participant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {isOwner && (
              <Button 
              className="gap-2 rounded-full px-5 py-2 transition-all shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700"
              size={isMobile ? "icon" : "default"}
                title="Ajouter un étudiant"
                onClick={() => setIsInviteOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {!isMobile && "Ajouter"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 rounded-full"></div>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="divide-y">
            {filteredStudents.map((student) => (
              <div 
                key={student._id} 
                className="py-3"
              >
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden">
                    <div className="font-medium truncate flex items-center gap-2">
                      {student.name}
                      {student.isTeacher && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          <span>Prof</span>
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{student.email}</div>
                    {isOwner && !student.isTeacher && renderProgressStats(student._id)}
                  </div>
                  
                  {isOwner && !student.isTeacher && (
                    isMobile ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 h-8 w-8 p-0 flex-shrink-0"
                        onClick={() => handleRemoveStudent(student)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveStudent(student)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">
            {searchTerm ? "Aucun participant ne correspond à votre recherche." : "Aucun participant inscrit."}
          </div>
        )}
      </CardContent>
      
      {/* Invitation Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un étudiant</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email de l'étudiant
            </label>
            <Input
              id="email-input"
              type="email"
              placeholder="exemple@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            {inviteError && (
              <p className="mt-1 text-sm text-red-600">{inviteError}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Un email d'invitation sera envoyé à cette adresse avec les instructions pour rejoindre le cours.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsInviteOpen(false);
              setInviteError("");
              setInviteEmail("");
            }} disabled={isSending}>
              Annuler
            </Button>
            <Button onClick={handleSendInvitation} disabled={isSending}>
              {isSending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Envoi...
                </>
              ) : (
                "Envoyer l'invitation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation pour la suppression d'étudiant */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Supprimer l'étudiant</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {studentToDelete?.name} du cours ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setStudentToDelete(null);
              }}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteStudent}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default StudentList;