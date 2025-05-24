import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const QuestionForm = ({ onSubmit, onCancel }) => {
  const [text, setText] = useState("");
  const [choices, setChoices] = useState(["", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [points, setPoints] = useState(1);
  const [questionType, setQuestionType] = useState("multipleChoice");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (questionType === "multipleChoice") {
      const validChoices = choices.filter(choice => choice.trim() !== "");
      if (validChoices.length < 2) {
        alert("Please add at least 2 choices");
        return;
      }
      if (correctAnswer === null || correctAnswer === undefined) {
        alert("Please select the correct answer");
        return;
      }
      if (!validChoices[correctAnswer]) {
        alert("The correct answer must be selected from the non-empty choices");
        return;
      }
    }
    
    onSubmit({ 
      Text: text, 
      options: questionType === "multipleChoice" ? choices.filter(Boolean) : undefined, 
      correctAnswer: questionType === "multipleChoice" ? correctAnswer : undefined,
      points: Number(points),
      questionType
    });
  };

  const handleChoiceChange = (index, value) => {
    const updatedChoices = [...choices];
    updatedChoices[index] = value;
    setChoices(updatedChoices);
    
    // Reset correct answer if the selected choice was modified
    if (correctAnswer === index && value.trim() === "") {
      setCorrectAnswer(null);
    }
  };

  const addChoice = () => setChoices([...choices, ""]);
  const removeChoice = (index) => {
    const newChoices = choices.filter((_, i) => i !== index);
    setChoices(newChoices);
    
    // Adjust correct answer index if needed
    if (correctAnswer === index) {
      setCorrectAnswer(null);
    } else if (correctAnswer > index) {
      setCorrectAnswer(correctAnswer - 1);
    }
  };

  const nonEmptyChoices = choices.filter(choice => choice.trim() !== "");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Question Type</Label>
        <Select 
          value={questionType} 
          onValueChange={(value) => {
            setQuestionType(value);
            if (value !== "multipleChoice") setCorrectAnswer(null);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Question Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multipleChoice">Multiple Choice</SelectItem>
            <SelectItem value="openEnded">Open Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Question Text</Label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter question text..."
          required
        />
      </div>
      
      {questionType === "multipleChoice" && (
        <div className="space-y-4">
          <Label>Choices</Label>
          <div className="space-y-2">
            {choices.map((choice, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={choice}
                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                  placeholder={`Choice ${index + 1}`}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeChoice(index)}
                  disabled={choices.length <= 2}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addChoice}>
              Add Choice
            </Button>
          </div>

          {nonEmptyChoices.length > 0 && (
            <div className="mt-4">
              <Label>Correct Answer</Label>
              <RadioGroup 
                value={correctAnswer !== null ? correctAnswer.toString() : ""}
                onValueChange={(value) => setCorrectAnswer(parseInt(value))}
                className="mt-2"
              >
                {choices.map((choice, index) => (
                  choice.trim() !== "" && (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`correct-${index}`} />
                      <Label htmlFor={`correct-${index}`} className="font-normal">
                        {choice || `Choice ${index + 1}`}
                      </Label>
                    </div>
                  )
                ))}
              </RadioGroup>
            </div>
          )}
        </div>
      )}
      
      <div>
        <Label>Points</Label>
        <Input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder="Points"
          min="1"
          required
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Question</Button>
      </div>
    </form>
  );
};

export default QuestionForm;