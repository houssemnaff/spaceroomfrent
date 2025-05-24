import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
//import { Switch } from "@/components/ui/switch"; <Switch checked={form.isPublished} onCheckedChange={handleToggle} />

const QuizSettings = ({ quizData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: quizData.title,
    description: quizData.description,
    timeLimit: quizData.timeLimit || "",
    accessKey: quizData.accessKey || "",
    isPublished: quizData.isPublished,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setForm((prev) => ({ ...prev, isPublished: !prev.isPublished }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Quiz Title"
        required
      />
      <Textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Quiz Description"
      />
      <Input
        type="number"
        name="timeLimit"
        value={form.timeLimit}
        onChange={handleChange}
        placeholder="Time Limit (minutes)"
        min="1"
      />
      <Input
        name="accessKey"
        value={form.accessKey}
        onChange={handleChange}
        placeholder="Access Key"
      />
      <div className="flex items-center gap-2">
       
        <span>{form.isPublished ? "Published" : "Draft"}</span>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default QuizSettings;
