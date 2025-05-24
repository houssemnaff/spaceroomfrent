import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/pages/auth/authContext";
import { addChapter } from "@/services/chapterApi";
import { toast } from "react-toastify";

export default function AddChapterDialog({ open, onClose, onSubmit, courseId }) {
  const [chapter, setChapter] = useState({
    title: "",
    number: "",
    description: "", // Keep the property name as description for backend compatibility
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChapter((prev) => ({ ...prev, [name]: name === "number" ? Number(value) : value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    if (!chapter.title || !chapter.description) {
      toast.info("Les champs Titre et Objectif sont obligatoires !", {
        containerId: "devoirs-toast"}
);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = { ...chapter };
      const newChapter = await addChapter(courseId, data, token);
      toast.success("Chapitre ajouté avec succès !", {
        containerId: "devoirs-toast"}
);
      onSubmit(newChapter);
      setChapter({ title: "", number: "", description: "" }); // Reset the form
      onClose();
    } catch (error) {
      console.error("Erreur:", error.message);
      alert(error.message || "Une erreur s'est produite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un chapitre</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right font-medium">
              Titre
            </label>
            <Input
              id="title"
              name="title"
              value={chapter.title}
              onChange={handleChange}
              placeholder="Titre du chapitre"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="number" className="text-right font-medium">
              Numéro
            </label>
            <Input
              id="number"
              name="number"
              type="number"
              value={chapter.number}
              onChange={handleChange}
              placeholder="Numéro du chapitre"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right font-medium">
              Objectif
            </label>
            <Textarea
              id="description"
              name="description"
              value={chapter.description}
              onChange={handleChange}
              placeholder="Objectif du chapitre"
              className="col-span-3"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ajout en cours..." : "Ajouter Chapitre"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}