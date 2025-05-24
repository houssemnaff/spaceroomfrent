import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/pages/auth/authContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { generateAssignmentWithAI } from "@/services/assigmentapi";

const AIAssignmentGeneratorDialog = ({ isOpen, onClose, courseId, onAssignmentGenerated }) => {
  const { token } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    difficulty: "medium",
    topicDetails: "",
    gradeLevel: "university"
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const assignmentData = {
        ...formData,
        courseId
      };
      
      const response = await generateAssignmentWithAI(assignmentData, token);
      onAssignmentGenerated(response.data);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la génération du devoir:", error);
      alert("Erreur lors de la génération du devoir: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] h-auto max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b">
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Générer un devoir avec l'IA
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleGenerate} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 px-4 sm:px-6 py-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm sm:text-base">Sujet du devoir*</Label>
                <Input
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Par exemple: Analyse des œuvres de Victor Hugo"
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label className="text-sm sm:text-base">Détails du sujet (optionnel)</Label>
                <Textarea
                  name="topicDetails"
                  value={formData.topicDetails}
                  onChange={handleInputChange}
                  placeholder="Précisez les aspects spécifiques que vous souhaitez aborder dans ce devoir"
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm sm:text-base">Niveau</Label>
                  <Select 
                    value={formData.gradeLevel} 
                    onValueChange={(value) => handleSelectChange("gradeLevel", value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Universitaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elementary">Primaire</SelectItem>
                      <SelectItem value="middle">Collège</SelectItem>
                      <SelectItem value="high">Lycée</SelectItem>
                      <SelectItem value="university">Universitaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm sm:text-base">Difficulté</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => handleSelectChange("difficulty", value)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Moyenne" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Facile</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="hard">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 mt-2">
                <p>L'IA va générer un devoir basé sur les informations fournies. Vous pourrez modifier tous les détails avant de finaliser.</p>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t mt-auto">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="w-full sm:w-auto order-2 sm:order-1"
                disabled={isGenerating}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isGenerating}
                className="w-full sm:w-auto order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <span className="mr-2">Génération en cours...</span>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer le devoir
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssignmentGeneratorDialog;