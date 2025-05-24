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

// Create a new QuizAIService for AI-related operations
const QuizAIService = {
  generateQuiz: async (quizData, token) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/quizch/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(quizData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la génération du quiz');
    }
    
    return response.json();
  }
};

const AIQuizGeneratorDialog = ({ isOpen, onClose, courseId, chapterId, onQuizGenerated }) => {
  const { token } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    numQuestions: 5,
    difficulty: "medium"
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
      const quizData = {
        ...formData,
        courseId,
        chapterId
      };
      
      const response = await QuizAIService.generateQuiz(quizData, token);
      onQuizGenerated(response.data);
      onClose();
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Erreur lors de la génération du quiz: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] h-auto max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b">
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Générer un quiz avec l'IA
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleGenerate} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 px-4 sm:px-6 py-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm sm:text-base">Sujet du quiz*</Label>
                <Textarea
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  required
                  placeholder="Par exemple: La Révolution française, Les équations du second degré, Le système solaire..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm sm:text-base">Nombre de questions</Label>
                  <Select 
                    value={formData.numQuestions.toString()} 
                    onValueChange={(value) => handleSelectChange("numQuestions", parseInt(value))}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="5" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 questions</SelectItem>
                      <SelectItem value="5">5 questions</SelectItem>
                      <SelectItem value="7">7 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
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
                <p>L'IA va générer un quiz basé sur le sujet indiqué. Vous pourrez modifier les questions et réponses avant de finaliser le quiz.</p>
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
                className="w-full sm:w-auto order-1 sm:order-2 bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <span className="mr-2">Génération en cours...</span>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer le quiz
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

export default AIQuizGeneratorDialog;