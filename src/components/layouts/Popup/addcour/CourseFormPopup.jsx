import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CourseForm from "../../addcour/CourseForm";
import CoursePreview from "../../addcour/CoursePreview";
import { useAuth } from "@/pages/auth/authContext";
import { createCourse } from "@/services/coursapi";
import { toast } from "react-toastify";

const CourseFormPopup = ({ isOpen, onOpenChange, onSubmit, onCancel }) => {
  const [previewData, setPreviewData] = useState({
    title: "",
    matiere: "", // Changé de subject à matiere
    description: "", // Ajouté car requis par le backend
    imageUrl: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const { token } = useAuth();

  const validateForm = (data) => {
    const errors = {};
    
    if (!data.title?.trim()) {
      toast.info( "Le titre est requis", {
        containerId: "devoirs-toast"}
  );
    }
    
    if (!data.matiere?.trim()) { // Changé de subject à matiere
      errors.matiere = "La matière est requise";
    }
    
    if (!data.description?.trim()) { // Ajouté car requis par le backend
      errors.description = "La description est requise";
    }
    
    if (!data.imageFile) {
      errors.imageFile = "L'image du cours est requise";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (data) => {
    if (!validateForm(data)) {
      toast.info("Veuillez remplir tous les champs obligatoires", {
        containerId: "devoirs-toast"}
  );
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('matiere', data.matiere); // Changé de subject à matiere
      formData.append('description', data.description); // Champ obligatoire
      formData.append('image', data.imageFile); // Le backend attend le fichier image


      const course = await createCourse(data, token);

      
      //  toast.success("Course created ! 🎉");
           
      // Mettre à jour l'aperçu avec les données retournées
      setPreviewData({
        title: course.title,
        subject: course.matiere,
        description: course.description,
        imageUrl: course.imageUrl // Notez le changement de casse (imageurl vs imageUrl)
      });

      onSubmit(course);
      onOpenChange(false);
    } catch (error) {
     // console.error("Erreur création cours:", error);
      toast.error(`Échec de la création: ${error.message}`, {
        containerId: "devoirs-toast"}
  );
    }
  };

  const handlePreviewUpdate = (data) => {
    setPreviewData(prev => ({
      ...prev,
      title: data.title ?? prev.title,
      matiere: data.matiere ?? prev.matiere, // Changé de subject à matiere
      description: data.description ?? prev.description,
      imageUrl: data.imageUrl ?? prev.imageUrl
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un cours</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CourseForm
            onCancel={() => {
              setFormErrors({});
              onCancel();
            }}
            onSubmit={handleFormSubmit}
            onPreviewUpdate={handlePreviewUpdate}
            errors={formErrors}
          />

          <CoursePreview
            title={previewData.title}
            subject={previewData.matiere} // Changé pour utiliser matiere
            description={previewData.description}
            imageUrl={previewData.imageUrl}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseFormPopup;