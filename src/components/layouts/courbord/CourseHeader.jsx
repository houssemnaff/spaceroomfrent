import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clipboard, Link as LinkIcon, Settings, Eye } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/pages/auth/authContext";
import { fetchUserById } from "@/services/userapi";
import { Textarea } from "@/components/ui/Textarea";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageUpload from "../addcour/ImageUpload";
import { updateCourse } from "@/services/coursapi";

// Imports pour la fonctionnalité de popup
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

export const CourseHeader = ({ course, onCourseUpdate }) => {
  const [professorData, setProfessorData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedItem, setCopiedItem] = useState('');
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // État pour contrôler l'affichage du QR code
  const [showQRCode, setShowQRCode] = useState(false);
  
  // État local du cours qui sera mis à jour en direct
  const [localCourse, setLocalCourse] = useState(course);
  
  const [updateData, setUpdateData] = useState({
    title: course.title,
    description: course.description,
    imageFile: null
  });

  // Extraction des données du cours avec valeurs par défaut
  const { 
    title, 
    description, 
    imageurl = "/placeholder-course.jpg",
    accessKey,
    owner 
  } = localCourse; // Utiliser localCourse au lieu de course

  const joinLink = accessKey ? `${window.location.origin}/course/join/${accessKey}` : "#";
  const isOwner = user?._id === owner._id;

  // Mettre à jour l'état local quand le prop course change
  useEffect(() => {
    setLocalCourse(course);
  }, [course]);

  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        const response = await fetchUserById(owner._id, token);
        setProfessorData(response);
      } catch (error) {
        console.error("Failed to fetch professor data:", error);
        setProfessorData({
          name: owner.name || "Professeur",
          imageurl: owner.imageurl || "",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessor();
  }, [owner._id, token]);

  // Reset update form data when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setUpdateData({
        title: localCourse.title,
        description: localCourse.description,
        imageFile: null
      });
    }
  }, [isDialogOpen, localCourse]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopiedItem(type);
    
    // Afficher un toast pour la copie
    toast.info(`${type} copié avec succès !`, {
      containerId: "devoirs-toast"

    });
    
    setTimeout(() => {
      setCopied(false);
      setCopiedItem('');
    }, 2000);
  };

  const handleToggleQRCode = () => {
    setShowQRCode(prev => !prev);
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      
      // Validation des données
      if (!updateData.title.trim()) {
        toast.error("Le titre du cours ne peut pas être vide", {
          containerId: "devoirs-toast"
  
        });
        return;
      }
     
      // Préparer les données à envoyer
      const formData = new FormData();
      formData.append('title', updateData.title);
      formData.append('description', updateData.description || '');
      
      // Ajouter l'image seulement si elle a été modifiée
      if (updateData.imageFile) {
        // Utiliser 'file' comme nom de champ pour correspondre au backend
        formData.append('file', updateData.imageFile);
      }

    

      // CORRECTION: Envoyer formData au lieu de updateData
      const response = await updateCourse(localCourse._id, updateData, token);
      
      if (response) {
        // Mettre à jour l'état local immédiatement
        const updatedCourse = response.course || response;
        setLocalCourse(prevCourse => ({
          ...prevCourse,
          title: updatedCourse.title,
          description: updatedCourse.description,
          imageurl: updatedCourse.imageurl || prevCourse.imageurl
        }));
        
        toast.success("Cours mis à jour avec succès ! ", {
          containerId: "devoirs-toast"
  
        });
        
        // Propager la mise à jour au composant parent
        if (onCourseUpdate) {
          onCourseUpdate(updatedCourse);
        }
        
        setIsDialogOpen(false);
        
        setUpdateData({
          title: updatedCourse.title,
          description: updatedCourse.description,
          imageFile: null
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du cours:", error);
      toast.error(error.message || "Erreur lors de la mise à jour du cours ", {
        containerId: "devoirs-toast"

      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    // Réinitialiser les données du formulaire aux valeurs actuelles du cours
    setUpdateData({
      title: localCourse.title,
      description: localCourse.description,
      imageFile: null
    });
    setIsDialogOpen(false);
  };

  // Fonction pour générer un QR Code en SVG pour la clé d'accès
  const generateQRCodeSVG = () => {
    // Utilisation de la SVG inline pour créer un QR code simple
    // Ceci est un exemple simplifié, dans une application réelle,
    // il serait préférable d'utiliser une bibliothèque dédiée comme qrcode.react
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${joinLink}`;
  };

  if (isLoading) {
    return (
      <Card className="relative w-full overflow-hidden rounded-lg shadow-sm border border-gray-200 h-48 md:h-64 lg:h-72 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
      </Card>
    );
  }

  // Générer les initiales à partir du nom du professeur
  const professorInitials = professorData?.name
    ? professorData.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : "P";

  return (
    <>
      <ToastContainer />
      <Card className="relative w-full overflow-hidden rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="h-48 md:h-64 lg:h-72">
          <img
            src={imageurl}
            className="absolute inset-0 w-full h-full object-cover"
            alt={`Couverture du cours ${title}`}
            onError={(e) => {
              e.target.src = "/placeholder-course.jpg";
            }}
            loading="lazy" // Optimisation du chargement
          />
          
          {/* Structure modifiée - contenu réorganisé avec flexbox pour positionner en haut */}
          <div className="relative h-full flex flex-col">
            {/* Barre supérieure avec titre et bouton paramètres */}
            <div className="bg-gradient-to-b from-black/60 to-transparent p-3 sm:p-4 flex justify-between items-start z-10">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {title}
                </CardTitle>
                <CardDescription className="text-white/80 text-xs sm:text-sm max-w-prose line-clamp-2">
                  {description}
                </CardDescription>
              </div>
              
              {isOwner && (
                <div className="flex gap-2">
                  {/* Bouton pour afficher le QR Code */}
                  <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full"
                        onClick={handleToggleQRCode}
                      >
                        <Eye className="w-5 h-5" />
                        <span className="sr-only">Afficher QR Code</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[350px] flex flex-col items-center justify-center">
                      <DialogHeader>
                        <DialogTitle className="text-center text-xl">Code d'accès QR</DialogTitle>
                      </DialogHeader>
                      <div className="my-6 flex flex-col items-center">
                        <img 
                          src={generateQRCodeSVG()} 
                          alt="QR Code de la clé d'accès"
                          className="w-48 h-48 mb-4"
                        />
                        <p className="text-center font-medium mt-2">Clé: {accessKey}</p>
                        <p className="text-xs text-center text-gray-500 mt-1">
                          Scannez ce code QR pour accéder directement au cours
                        </p>
                      </div>
                      <div className="flex justify-center w-full">
                        <Button onClick={() => setShowQRCode(false)}>Fermer</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Bouton des paramètres */}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full"
                      >
                        <Settings className="w-5 h-5" />
                        <span className="sr-only">Modifier le cours</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="text-xl">Modifier les détails du cours</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label htmlFor="title" className="text-sm font-medium">
                            Titre du cours *
                          </label>
                          <Input
                            id="title"
                            value={updateData.title}
                            onChange={(e) => setUpdateData({ ...updateData, title: e.target.value })}
                            placeholder="Titre du cours"
                            className="focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="description" className="text-sm font-medium">
                            class
                          </label>
                          <Input
                            id="description"
                            value={updateData.description}
                            onChange={(e) => setUpdateData({ ...updateData, description: e.target.value })}
                            placeholder="Description du cours"
                            className="focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">
                            Image du cours
                          </label>
                          <ImageUpload
                            onImageUpload={(imageUrl, file) => {
                              setUpdateData({ ...updateData, imageFile: file });
                            }}
                            currentImage={imageurl}
                          />
                          <p className="text-xs text-gray-500">
                            Format recommandé: 1280x720px ou 16:9
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          type="button"
                          className="border-gray-300"
                        >
                          Annuler
                        </Button>
                        <Button
                          onClick={handleUpdate}
                          disabled={isUpdating}
                          type="button"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isUpdating ? (
                            <>
                              <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                              Mise à jour...
                            </>
                          ) : "Mettre à jour"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
            
            {/* Espace flexible pour pousser le contenu suivant vers le bas */}
            <div className="flex-grow"></div>
            
            {/* Partie inférieure avec info prof et liens d'accès */}
            <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-t from-black/70 to-transparent">
              {/* Info du professeur */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white">
                  <AvatarImage 
                    src={professorData?.imageurl} 
                    alt={`Avatar de ${professorData?.name}`} 
                  />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {professorInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {professorData?.name || "Professeur"}
                  </span>
                  <span className="text-white/70 text-xs hidden sm:block">Professeur</span>
                </div>
              </div>

              {/* Clé d'accès et lien d'invitation - Visible uniquement pour le propriétaire du cours */}
              {isOwner && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-3">
                  <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm p-1 sm:p-2 rounded-lg">
                    <span className="text-xs sm:text-sm text-white/80 whitespace-nowrap">Clé d'accès:</span>
                    <Input
                      value={accessKey}
                      readOnly
                      className="w-16 sm:w-24 text-xs sm:text-sm text-white bg-transparent border-none focus:ring-0 p-0 sm:p-1"
                    />
                    <Button
                      onClick={() => handleCopy(accessKey, "Clé d'accès")}
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-gray-800/50 h-6 w-6 sm:h-8 sm:w-8"
                    >
                      <Clipboard className="w-3 h-3 sm:w-4 sm:h-4" />
                      {copied && copiedItem === "Clé d'accès" && (
                        <span className="absolute -top-8 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded-md">
                          Copié!
                        </span>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm p-1 sm:p-2 rounded-lg">
                    <span className="text-xs sm:text-sm text-white/80 whitespace-nowrap">Lien d'invitation:</span>
                    <Input
                      value={joinLink}
                      readOnly
                      className="w-24 sm:w-40 text-xs sm:text-sm text-white bg-transparent border-none focus:ring-0 p-0 sm:p-1 truncate"
                    />
                    <Button
                      onClick={() => handleCopy(joinLink, "Lien d'invitation")}
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-gray-800/50 h-6 w-6 sm:h-8 sm:w-8"
                    >
                      <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      {copied && copiedItem === "Lien d'invitation" && (
                        <span className="absolute -top-8 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded-md">
                          Copié!
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};