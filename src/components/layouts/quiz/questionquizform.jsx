import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Plus, Save, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const QuestionCreationForm = ({ onSave, onCancel, question = null }) => {
  const [questionData, setQuestionData] = useState(question || {
    questionText: "",
    questionType: "multipleChoice",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false }
    ],
    correctAnswer: "",
    points: 1
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setQuestionData({
      ...questionData,
      [name]: type === "number" ? parseInt(value, 10) : value
    });
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...questionData.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value
    };
    setQuestionData({
      ...questionData,
      options: updatedOptions
    });
  };

  const handleAddOption = () => {
    setQuestionData({
      ...questionData,
      options: [...questionData.options, { text: "", isCorrect: false }]
    });
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = questionData.options.filter((_, i) => i !== index);
    setQuestionData({
      ...questionData,
      options: updatedOptions
    });
  };

  const handleCorrectOptionChange = (index) => {
    if (questionData.questionType === "multipleChoice") {
      // For multiple choice, toggle the current option
      handleOptionChange(index, "isCorrect", !questionData.options[index].isCorrect);
    } else {
      // For single answer questions (e.g., true/false), only one can be correct
      const updatedOptions = questionData.options.map((option, i) => ({
        ...option,
        isCorrect: i === index
      }));
      setQuestionData({
        ...questionData,
        options: updatedOptions
      });
    }
  };

  const handleTypeChange = (newType) => {
    let updatedQuestion = {
      ...questionData,
      questionType: newType
    };

    // Reset options for different question types
    if (newType === "trueFalse") {
      updatedQuestion.options = [
        { text: "Vrai", isCorrect: false },
        { text: "Faux", isCorrect: false }
      ];
    } else if (newType === "shortAnswer") {
      updatedQuestion.options = [];
      updatedQuestion.correctAnswer = "";
    } else if (newType === "multipleChoice" && (!questionData.options || questionData.options.length < 2)) {
      updatedQuestion.options = [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ];
    }

    setQuestionData(updatedQuestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!questionData.questionText.trim()) {
      alert("Veuillez saisir le texte de la question");
      return;
    }
    
    if (questionData.questionType === "multipleChoice" || questionData.questionType === "trueFalse") {
      const hasCorrectOption = questionData.options.some(opt => opt.isCorrect);
      if (!hasCorrectOption) {
        alert("Veuillez sélectionner au moins une réponse correcte");
        return;
      }
      
      const emptyOption = questionData.options.some(opt => !opt.text.trim());
      if (emptyOption) {
        alert("Toutes les options doivent avoir un texte");
        return;
      }
    } else if (questionData.questionType === "shortAnswer") {
      if (!questionData.correctAnswer.trim()) {
        alert("Veuillez saisir la réponse correcte");
        return;
      }
    }
    
    onSave(questionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="questionType">Type de question</Label>
        <RadioGroup 
          value={questionData.questionType} 
          onValueChange={handleTypeChange}
          className="flex space-x-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="multipleChoice" id="multipleChoice" />
            <Label htmlFor="multipleChoice">Choix multiple</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="trueFalse" id="trueFalse" />
            <Label htmlFor="trueFalse">Vrai/Faux</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="shortAnswer" id="shortAnswer" />
            <Label htmlFor="shortAnswer">Réponse courte</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <Label htmlFor="questionText">Question *</Label>
        <Textarea
          id="questionText"
          name="questionText"
          value={questionData.questionText}
          onChange={handleChange}
          placeholder="Saisissez votre question ici"
          rows={3}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="points">Points</Label>
        <Input
          id="points"
          name="points"
          type="number"
          value={questionData.points}
          onChange={handleChange}
          min={1}
          max={100}
          className="w-24"
        />
      </div>
      
      {(questionData.questionType === "multipleChoice" || questionData.questionType === "trueFalse") && (
        <div className="space-y-3">
          <Label>Options</Label>
          
          {questionData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={option.isCorrect}
                  onCheckedChange={() => handleCorrectOptionChange(index)}
                />
                <Label htmlFor={`option-${index}`} className="text-sm font-normal">
                  Correct
                </Label>
              </div>
              
              <Input
                value={option.text}
                onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              
              {questionData.options.length > 2 && questionData.questionType !== "trueFalse" && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveOption(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          {questionData.questionType === "multipleChoice" && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleAddOption}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" /> Ajouter une option
            </Button>
          )}          {questionData.questionType === "multipleChoice" && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleAddOption}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" /> Ajouter une option
            </Button>
          )}
        </div>
      )}

      {questionData.questionType === "shortAnswer" && (
        <div>
          <Label htmlFor="correctAnswer">Réponse correcte *</Label>
          <Input
            id="correctAnswer"
            name="correctAnswer"
            value={questionData.correctAnswer}
            onChange={(e) => setQuestionData({
              ...questionData,
              correctAnswer: e.target.value
            })}
            placeholder="Saisissez la réponse correcte"
            required
          />
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {question ? "Mettre à jour" : "Créer"} la question
        </Button>
      </div>
    </form>
  );
};

export default QuestionCreationForm;