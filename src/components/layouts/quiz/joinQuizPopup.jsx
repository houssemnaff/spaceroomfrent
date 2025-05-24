import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/pages/auth/authContext";
import { joinQuiz } from "@/services/quizapi";
import { toast } from "react-toastify";

const JoinQuizPopup = ({ isOpen, onOpenChange, onSubmit, onCancel }) => {
  const { token } = useAuth();
  const [accessKey, setAccessKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await joinQuiz(accessKey, token);
      toast.success("Quiz rejoint avec succès !");
      onSubmit(result);
      onOpenChange(false);
      setAccessKey("");
    } catch (error) {
      console.error("Erreur lors de la jointure du quiz", error);
      toast.error(error.message || "Échec de rejoindre le quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 max-w-md">
        <DialogHeader>
          <DialogTitle>Rejoindre un quiz</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="accessKey">Clé d'accès</Label>
            <Input
              id="accessKey"
              type="text"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="Entrez la clé d'accès du quiz"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Obtenez cette clé auprès de votre enseignant
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
              {isLoading ? "Rejoindre..." : "Rejoindre le quiz"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinQuizPopup;