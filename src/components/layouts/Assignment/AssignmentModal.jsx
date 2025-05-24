import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/pages/auth/authContext";
import { X, Upload, File, Sparkles, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { createAssignment, updateAssignment } from "@/services/assigmentapi";

import AIAssignmentGeneratorDialog from "./aiassigmentemodal";
import { toast } from "react-toastify";

const AssignmentModal = ({ isOpen, onClose, assignment, courseId }) => {
  const MAX_FILE_COUNT = 5;
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  // Constantes pour la validation des fichiers
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo en octets
  const ALLOWED_FILE_TYPES = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|json|csv/;

  // État initial pour la réinitialisation
  const getInitialFormData = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const defaultDueDate = format(nextWeek, "yyyy-MM-dd'T'HH:mm");

    return {
      title: "",
      description: "",
      dueDate: defaultDueDate,
      maxPoints: 100,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  // Réinitialiser tous les états
  const resetAllStates = () => {
    setFormData(getInitialFormData());
    setFiles([]);
    setExistingFiles([]);
    setFilesToRemove([]);
    setError("");
    setFileError("");
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (assignment) {
        // Mode édition - charger les données de l'assignment
        const dueDate = new Date(assignment.dueDate);
        const localDueDate = format(dueDate, "yyyy-MM-dd'T'HH:mm");

        setFormData({
          title: assignment.title,
          description: assignment.description,
          dueDate: localDueDate,
          maxPoints: assignment.maxPoints,
        });

        // Set existing files if any
        if (assignment.attachments && assignment.attachments.length > 0) {
          setExistingFiles(assignment.attachments);
        }
      } else {
        // Mode création - réinitialiser complètement
        resetAllStates();
      }
    }
  }, [assignment, isOpen]);

  const handleClose = () => {
    resetAllStates();
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateFile = (file) => {
    // Vérifier l'extension du fichier
    const extension = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_FILE_TYPES.test(extension)) {
      return {
        valid: false,
        message: `Type de fichier non supporté: ${extension}. Veuillez choisir un des formats autorisés.`
      };
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: `Le fichier ${file.name} dépasse la limite de 5 Mo.`
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
        toast.error(`Trop de fichiers sélectionnés ! Maximum ${MAX_FILE_COUNT} fichiers autorisés par requête.`);
        e.target.value = ''; // Réinitialise l'input
        return;
      }

      let validFiles = [];

      for (const file of newFiles) {
        const validation = validateFile(file);

        if (validation.valid) {
          validFiles.push(file);
        } else {
          setFileError(validation.message);
          toast.error(validation.message);
          e.target.value = ''; // Réinitialise l'input
          return;
        }
      }

      setFiles([...files, ...validFiles]);
      e.target.value = ''; // Réinitialise l'input pour permettre la sélection du même fichier
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setFileError(""); // Effacer l'erreur quand on supprime un fichier
  };

  const removeExistingFile = (filePath) => {
    // S'assurer que le chemin n'est pas déjà dans la liste
    if (!filesToRemove.includes(filePath)) {
      setFilesToRemove([...filesToRemove, filePath]);
    }
    setExistingFiles(existingFiles.filter(file => file.path !== filePath));
    setFileError(""); // Effacer l'erreur quand on supprime un fichier
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const assignmentData = {
        ...formData,
        courseId,
        newAttachments: files,
        // Envoyer les chemins à supprimer comme un tableau simple
        removeAttachments: filesToRemove
      };

      let response;
      if (assignment) {
        response = await updateAssignment(assignment._id, assignmentData, token);
        toast.success(
          "Devoir mis à jour"
          , {
            containerId: "devoirs-toast"

          });
      } else {
        response = await createAssignment(assignmentData, token);
       
      }

      handleClose();
      onClose(response.data || response);
    } catch (error) {
      setError(error.message || "Une erreur est survenue");
      toast.error(error.message || "Erreur lors de l'enregistrement du devoir", {
        containerId: "devoirs-toast"

      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGenerated = (generatedData) => {
    setFormData({
      ...formData,
      title: generatedData.title,
      description: generatedData.description,
      maxPoints: generatedData.maxPoints,
      // La date d'échéance est déjà initialisée ou préservée
    });

    toast.success(
      "Devoir généré avec succès ,Vous pouvez maintenant modifier les détails avant de créer le devoir.",
      {
        containerId: "devoirs-toast"
      });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-[95vw] max-w-4xl h-[95vh] max-h-[95vh] p-0 flex flex-col">
          {/* Header fixe */}
          <DialogHeader className="px-4 sm:px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-lg sm:text-xl font-semibold">
                {assignment ? "Modifier le devoir" : "Créer un nouveau devoir"}
              </span>
              {!assignment && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 w-full sm:w-auto"
                  onClick={() => setIsAIDialogOpen(true)}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="sm:inline">Générer avec l'IA</span>
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="py-4 space-y-6">
              {error && (
                <div className="p-3 text-red-700 bg-red-50 border border-red-200 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Layout responsive - colonne unique sur mobile, deux colonnes sur desktop */}
              <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
                {/* Section informations principales */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-900 border-b pb-2">
                    Informations du devoir
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Titre *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="resize-none min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dueDate" className="text-sm font-medium">Date limite</Label>
                      <Input
                        id="dueDate"
                        name="dueDate"
                        type="datetime-local"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxPoints" className="text-sm font-medium">Points max</Label>
                      <Input
                        id="maxPoints"
                        name="maxPoints"
                        type="number"
                        min="1"
                        max="1000"
                        value={formData.maxPoints}
                        onChange={handleChange}
                        className="h-11"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section pièces jointes */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-900 border-b pb-2">
                    Pièces jointes
                  </h3>

                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <strong>Formats autorisés:</strong> jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx, ppt, pptx, zip, json, csv
                      <br />
                      <strong>Taille max:</strong> 5 Mo par fichier
                      <br />
                      <strong>Limite:</strong> Maximum 5 fichiers par upload
                    </p>

                    <div
                      className="border-2 border-dashed border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300 transition-colors active:scale-95"
                      onClick={() => document.getElementById('attachments').click()}
                    >
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Cliquez pour ajouter</span>
                          <br />
                          <span className="text-xs">ou glissez vos fichiers ici</span>
                        </p>
                      </div>
                      <Input
                        id="attachments"
                        name="attachments"
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                        accept=".jpeg,.jpg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.json,.csv"
                      />
                    </div>

                    {fileError && (
                      <div className="flex items-start gap-2 text-red-500 text-sm p-2 bg-red-50 rounded">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{fileError}</span>
                      </div>
                    )}

                    {/* Liste des fichiers avec scroll interne */}
                    {(existingFiles.length > 0 || files.length > 0) && (
                      <div className="space-y-4 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                        {/* Fichiers existants */}
                        {existingFiles.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                              Fichiers existants ({existingFiles.length})
                            </p>
                            <div className="space-y-2">
                              {existingFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-100">
                                  <div className="flex items-center min-w-0 flex-1 gap-2">
                                    <File className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <span className="text-sm truncate font-medium">{file.filename}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-red-100 flex-shrink-0"
                                    onClick={() => removeExistingFile(file.path)}
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Nouveaux fichiers */}
                        {files.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                              Nouveaux fichiers ({files.length})
                            </p>
                            <div className="space-y-2">
                              {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-100">
                                  <div className="flex items-center min-w-0 flex-1 gap-2">
                                    <File className="h-4 w-4 text-green-500 flex-shrink-0" />
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
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer fixe */}
          <DialogFooter className="px-4 sm:px-6 py-4 border-t flex-shrink-0">
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
              <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Enregistrement..." : assignment ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour la génération par IA */}
      <AIAssignmentGeneratorDialog
        isOpen={isAIDialogOpen}
        onClose={() => setIsAIDialogOpen(false)}
        courseId={courseId}
        onAssignmentGenerated={handleAIGenerated}
      />
    </>
  );
};

export default AssignmentModal;