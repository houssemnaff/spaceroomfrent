import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const QuestionsList = ({ questions, onEdit, onDelete }) => {
    console.log("questttt",questions);
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <Card key={question._id || index}>
          <CardHeader>
            <CardTitle>
              {index + 1}. {question.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Points: {question.points || 1}
              </p>
              {question.choices && question.choices.length > 0 && (
                <ul className="list-disc ml-5 text-sm mt-1">
                  {question.choices.map((choice, i) => (
                    <li key={i}>{choice}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(question._id)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(question._id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuestionsList;
