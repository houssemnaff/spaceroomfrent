import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FaUserFriends, FaCog } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/pages/auth/authContext";
import { fetchUserById } from "@/services/userapi";
import { fetchCourseProgress } from "@/services/progressApi";
import { Trash2, LogOut, CheckCircle } from "lucide-react";
import { deleteCourse, removeStudentFromCourse, updateCourse } from "@/services/coursapi";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const CourseCard = ({ id, icon, title, description,students, isOwner, ownerid, onCourseDeleted, onCourseLeft, onCourseUpdated }) => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
//console.log("student ",students);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ownerInfo = await fetchUserById(ownerid, token);
        setOwnerData(ownerInfo);

        if (user && user._id) {
          const progress = await fetchCourseProgress(user._id, id, token);
          setProgressData(progress);
          setIsCompleted(progress?.progress?.isCompleted || false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ownerid, id, token, user]);

  const handleCardClick = () => {
    navigate(`/home/course/${id}`);
  };

  const handleDeleteCourse = (e) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteCourse = async () => {
    try {
      await deleteCourse(id, token);
      toast.success("Cours supprimé avec succès", {
        containerId: "devoirs-toast"

      });
      onCourseDeleted?.(id);
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Erreur lors de la suppression du cours", {
        containerId: "devoirs-toast"

      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleLeaveCourse = (e) => {
    e.stopPropagation();
    setIsLeaveDialogOpen(true);
  };
  
  const confirmLeaveCourse = async () => {
    try {
    await removeStudentFromCourse(id, user._id, token);
      toast.success("Vous avez quitté le cours", {
        containerId: "devoirs-toast"

      });
      onCourseLeft?.(id);
    } catch (error) {
      console.error("Error leaving course:", error);
      toast.error("Erreur lors de la tentative de quitter le cours", {
        containerId: "devoirs-toast"

      });
    } finally {
      setIsLeaveDialogOpen(false);
    }
  };

  const handleMarkAsCompleted = async (e) => {
    e.stopPropagation();
    try {
      if (isOwner) {
        // Mettre à jour le cours comme terminé (pour le propriétaire)
        await updateCourse(id, { isCompleted: !isCompleted }, token);
        toast.success(`Cours marqué comme ${!isCompleted ? 'terminé' : 'non terminé'}`);
      } else {
        // Mettre à jour la progression de l'étudiant
        // Implémentez updateCourseProgress dans progressApi.js
        toast.success(`Cours marqué comme ${!isCompleted ? 'terminé' : 'non terminé'}`);
      }
      setIsCompleted(!isCompleted);
      onCourseUpdated?.();
    } catch (error) {
      console.error("Error updating course status:", error);
      toast.error("Erreur lors de la mise à jour du statut du cours", {
        containerId: "devoirs-toast"

      });
    }
  };


  if (loading) {
    return (
      <div className="w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-40 bg-gray-300 dark:bg-gray-700"></div>
          <div className="p-5 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-12 w-12 -mt-8 border-2 dark:border-gray-700"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-5/12"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card
        className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group relative border dark:border-gray-700"
        onClick={handleCardClick}
      >
        {/* Image Header with Gradient Overlay */}
        <div className="relative h-40 overflow-hidden border-b dark:border-gray-700">
          <img 
            src={icon} 
            alt="Course background" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
          
          {/* Badge in top-right corner */}
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium px-3 py-1 rounded-full shadow-md border border-indigo-400"
          >
            {description || "Classe"}
          </Badge>

          {/* Action buttons - Modernized */}
          <div className="absolute top-3 left-3 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isOwner ? (
              <button 
                onClick={handleDeleteCourse}
                className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-all duration-200 shadow-md backdrop-blur-sm border border-indigo-400"
                title="Supprimer le cours"
              >
                <Trash2 size={16} />
              </button>
            ) : (
              <button 
                onClick={handleLeaveCourse}
                className="p-2 bg-violet-500 hover:bg-violet-600 text-white rounded-full transition-all duration-200 shadow-md backdrop-blur-sm border border-violet-400"
                title="Quitter le cours"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-5">
          <div className="flex items-start space-x-3">
            <Avatar className="w-12 h-12 border-2 border-white dark:border-gray-600 shadow-md -mt-8">
              <AvatarImage src={ownerData?.imageurl} alt="Professor Avatar" />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {ownerData?.name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {ownerData?.name}
              </CardDescription>
            </div>
          </div>

          {/* Progress bar for "In Progress" state */}
          {progressData && !isOwner && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{progressData.progress.progressPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 border dark:border-gray-600">
                <div 
                  className={`h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                  style={{ width: `${progressData.progress.progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer with students count */}
        <CardFooter className="px-5 pb-4 flex items-center justify-between border-t dark:border-gray-700 pt-3">
          {isOwner && (
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <FaUserFriends className="w-4 h-4" />
              <span className="text-sm">{students} étudiants</span>
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 px-3 py-1 text-sm border dark:border-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
      
      {/* Dialog de confirmation pour la suppression de cours */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Supprimer le cour</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette cour ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCourse}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de confirmation pour quitter le cours */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Quitter le cours</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir quitter ce cours ? Vous pourrez toujours le rejoindre plus tard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmLeaveCourse}>
              Quitter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};