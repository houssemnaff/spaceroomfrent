import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/pages/auth/authContext";
import { createQuiz } from "@/services/quizapi";
import { toast } from "react-toastify";

const QuizFormPopup = ({ isOpen, onOpenChange, onSubmit, onCancel }) => {
  const { token } = useAuth();
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    openingDate: "",
    closingDate: "",
    timeLimit: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prev) => ({
      ...prev,
      [name]: name === "timeLimit" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const createdQuiz = await createQuiz(quizData, token);
      toast.success("Quiz créé avec succès !");
      onSubmit(createdQuiz);
      onOpenChange(false);
      setQuizData({ 
        title: "", 
        description: "", 
        openingDate: "",
        closingDate: "",
        timeLimit: 0 
      });
    } catch (error) {
      console.error("Erreur lors de la création du quiz", error);
      toast.error("Échec de la création du quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau quiz</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre du quiz</Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={quizData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={quizData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="openingDate">Date d'ouverture</Label>
              <Input
                id="openingDate"
                name="openingDate"
                type="datetime-local"
                value={quizData.openingDate}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="closingDate">Date de fermeture</Label>
              <Input
                id="closingDate"
                name="closingDate"
                type="datetime-local"
                value={quizData.closingDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="timeLimit">Durée limite (minutes)</Label>
            <Input
              id="timeLimit"
              name="timeLimit"
              type="number"
              min="0"
              value={quizData.timeLimit}
              onChange={handleChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              0 signifie pas de limite de temps
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onCancel();
                onOpenChange(false);
              }}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Création..." : "Créer le quiz"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuizFormPopup;