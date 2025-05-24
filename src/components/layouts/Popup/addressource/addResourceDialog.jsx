import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, Link, File } from "lucide-react";
import { useAuth } from "@/pages/auth/authContext";
import axios from "axios";
import { toast } from "react-toastify";

const AddResourceDialog = ({ 
  isOpen, 
  onClose, 
  courseId, 
  chapterId, 
  onResourceAdded 
}) => {
  const [resourceType, setResourceType] = useState("video");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlError, setUrlError] = useState("");
  const { token } = useAuth();

  // Fonction pour valider les liens YouTube
  const validateYouTubeUrl = (url) => {
    if (!url) return false;
    
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(url);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setName(e.target.files[0].name);
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setUrlError("");
    
    // Validation en temps réel pour les vidéos YouTube
    if (resourceType === "video" && newUrl.trim()) {
      if (!validateYouTubeUrl(newUrl)) {
        setUrlError("Veuillez entrer un lien YouTube valide");
      }
    }
  };

  const resetForm = () => {
    setResourceType("video");
    setName("");
    setUrl("");
    setFile(null);
    setError("");
    setUrlError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUrlError('');
    setIsLoading(true);

    // Validate inputs
    if (!name.trim()) {
      toast.info('Le nom de la ressource est requis', {
        containerId: "devoirs-toast"
  
      });
      setIsLoading(false);
      return;
    }

    // Validation spécifique pour les vidéos YouTube
    if (resourceType === "video" && url && !file) {
      if (!validateYouTubeUrl(url)) {
        setUrlError("Veuillez entrer un lien YouTube valide");
        toast.error('Lien YouTube invalide', {
          containerId: "devoirs-toast"
    
        });
        setIsLoading(false);
        return;
      }
    }

    // Vérifier qu'au moins une source est fournie (URL ou fichier)
    if (resourceType === "video" && !url && !file) {
      toast.info('Veuillez fournir un lien YouTube ou un fichier vidéo', {
        containerId: "devoirs-toast"
  
      });
      setIsLoading(false);
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', resourceType);
    
    // Add URL for link type or when no file is present
    if (url) {
      formData.append('url', url);
    }

    // Add file for file upload
    if (file) {
      formData.append('file', file);
    }

    try {
      // Send to backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/course/${courseId}/chapter/${chapterId}/resources`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Handle successful creation
      toast.success('Ressource ajoutée avec succès !', {
        containerId: "devoirs-toast"
  
      });
      
      onResourceAdded(response.data.resource);
      resetForm();
      onClose();
    } catch (err) {
      console.error('Erreur détaillée:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'ajout de la ressource';
      
      toast.error(errorMessage, {
        containerId: "devoirs-toast"
  
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une ressource</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type de ressource</Label>
            <RadioGroup value={resourceType} onValueChange={setResourceType} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video">Vidéo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="file" id="file" />
                <Label htmlFor="file">Fichier</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom de la ressource</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez le nom de votre ressource"
            />
          </div>
          
          {resourceType === "video" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Lien YouTube ou fichier vidéo</Label>
                <p className="text-sm text-gray-500">
                  Seuls les liens YouTube sont acceptés (ex: https://www.youtube.com/watch?v=...)
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      value={url}
                      onChange={handleUrlChange}
                      placeholder="Lien YouTube (https://www.youtube.com/watch?v=...)"
                      disabled={!!file}
                      className={urlError ? "border-red-500" : ""}
                    />
                    {urlError && (
                      <p className="text-red-500 text-sm mt-1">{urlError}</p>
                    )}
                  </div>
                  
                 
                </div>
                {file && (
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <File className="w-4 h-4 mr-2" />
                    <span className="truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-red-500 h-auto p-1"
                      onClick={() => setFile(null)}
                    >
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {resourceType === "file" && (
            <div className="space-y-2">
              <Label>Fichier</Label>
              <div className="flex items-center">
                <Label
                  htmlFor="fileUpload"
                  className="flex items-center justify-center w-full px-4 py-8 cursor-pointer border-2 border-dashed rounded-md bg-gray-50 hover:bg-gray-100"
                >
                  {file ? (
                    <div className="flex flex-col items-center">
                      <File className="w-8 h-8 mb-2 text-gray-500" />
                      <span className="text-sm text-gray-600 truncate max-w-full px-4">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <span className="text-sm text-gray-600">Cliquez pour choisir un fichier</span>
                    </div>
                  )}
                </Label>
                <Input
  id="fileUpload"
  type="file"
  className="hidden"
  onChange={handleFileChange}
  accept="
    .pdf,
    .jpeg,
    .jpg,
    .png,
    .svg,
    .csv,
    .xls,
    .xlsx,
    .docx,
    .pptx"
/>

              </div>
            </div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || urlError}>
              {isLoading ? "Ajout en cours..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddResourceDialog;