import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, GripVertical, Sparkles } from "lucide-react";
import QuizService from "@/services/quizchapitreapi";
import { useAuth } from "@/pages/auth/authContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import AIQuizGeneratorDialog from "./aiquizgenerate";
import { toast } from "react-toastify";

const AddQuizDialog = ({ isOpen, onClose, courseId, chapterId, onQuizAdded }) => {
    const { token } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        questions: [{ text: "", options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] }],
        availableFrom: new Date().toISOString().split('T')[0],
        availableUntil: "",
        timeLimit: 30
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Validation spéciale pour les dates
        if (name === "availableFrom") {
            const startDate = new Date(value);
            const endDate = formData.availableUntil ? new Date(formData.availableUntil) : null;
            const minEndDate = new Date(startDate.getTime() + formData.timeLimit * 60000); // Ajoute le temps limite en millisecondes
            
            // Si la date de fin existe et est antérieure à la date minimale requise
            if (endDate && endDate < minEndDate) {
                toast.info(`La date de fin doit être au moins ${formData.timeLimit} minutes après la date de début`, {
                    containerId: "devoirs-toast"
                });
                return;
            }
        }
        
        if (name === "availableUntil") {
            const startDate = new Date(formData.availableFrom);
            const endDate = value ? new Date(value) : null;
            const minEndDate = new Date(startDate.getTime() + formData.timeLimit * 60000);
            
            // Si la date de fin est antérieure à la date minimale requise
            if (endDate && endDate < minEndDate) {
                toast.info(`La date de fin doit être au moins ${formData.timeLimit} minutes après la date de début`, {
                    containerId: "devoirs-toast"
                });
                return;
            }
        }

        // Si le temps limite change, vérifier la date de fin
        if (name === "timeLimit") {
            const startDate = new Date(formData.availableFrom);
            const endDate = formData.availableUntil ? new Date(formData.availableUntil) : null;
            const minEndDate = new Date(startDate.getTime() + value * 60000);
            
            if (endDate && endDate < minEndDate) {
                toast.info(`La date de fin doit être au moins ${value} minutes après la date de début`, {
                    containerId: "devoirs-toast"
                });
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Validation function to check for duplicate options
    const validateOptions = (questionIndex) => {
        const question = formData.questions[questionIndex];
        const optionTexts = question.options.map(opt => opt.text.trim().toLowerCase());
        const uniqueTexts = new Set(optionTexts);
        
        // Si certains textes sont vides ou si il y a des doublons
        return optionTexts.every(text => text !== "") && 
               uniqueTexts.size === question.options.length;
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        
        if (field === "text") {
            newQuestions[index].text = value;
        } else if (field.startsWith("option")) {
            const optionIndex = parseInt(field.split("-")[1]);
            newQuestions[index].options[optionIndex].text = value;
        } else if (field.startsWith("correct")) {
            const optionIndex = parseInt(field.split("-")[1]);
            newQuestions[index].options = newQuestions[index].options.map((opt, i) => ({
                ...opt,
                isCorrect: i === optionIndex
            }));
        }
        
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                { text: "", options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] }
            ]
        }));
    };

    const addOption = (questionIndex) => {
        const newQuestions = [...formData.questions];
        newQuestions[questionIndex].options.push({ text: "", isCorrect: false });
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const removeOption = (questionIndex, optionIndex) => {
        const newQuestions = [...formData.questions];
        if (newQuestions[questionIndex].options.length > 2) {
            newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
            setFormData(prev => ({ ...prev, questions: newQuestions }));
        }
    };

    const removeQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation des dates
        const startDate = new Date(formData.availableFrom);
        const endDate = formData.availableUntil ? new Date(formData.availableUntil) : null;
        const minEndDate = new Date(startDate.getTime() + formData.timeLimit * 60000);
        
        if (endDate && endDate < minEndDate) {
            toast.error(`La date de fin doit être au moins ${formData.timeLimit} minutes après la date de début`, {
                containerId: "devoirs-toast"
            });
            return;
        }

        // Validation des doublons
        const hasDuplicates = formData.questions.some((q, qIndex) => {
            const optionTexts = q.options.map(opt => opt.text.trim().toLowerCase());
            const uniqueTexts = new Set(optionTexts);
            return uniqueTexts.size !== q.options.length || optionTexts.some(text => text === "");
        });
        
        if (hasDuplicates) {
            toast.info("Certaines questions ont des options en double ou vides. Veuillez corriger avant de soumettre.", {
                containerId: "devoirs-toast"
            });
            return;
        }
        
        setIsSubmitting(true);

        try {
            const quizData = {
                ...formData,
                courseId,
                chapterId,
                availableFrom: new Date(formData.availableFrom).toISOString(),
                availableUntil: formData.availableUntil ? new Date(formData.availableUntil).toISOString() : null,
                timeLimit: parseInt(formData.timeLimit)
            };

            const response = await QuizService.createQuiz(quizData, token);
            onQuizAdded(response.data);
            onClose();
            setIsSubmitting(false);
        } catch (error) {
            console.error("Error creating quiz:", error);
            toast.error("Erreur lors de la création du quiz", {
                containerId: "devoirs-toast"
            });
            setIsSubmitting(false);
        }
    };

    const handleAIQuizGenerated = (generatedQuiz) => {
        setFormData({
            title: generatedQuiz.title,
            description: generatedQuiz.description,
            questions: generatedQuiz.questions,
            availableFrom: new Date().toISOString().split('T')[0],
            availableUntil: "",
            timeLimit: 30
        });
    };

    // Don't render anything if not open
    if (!isOpen) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[95vw] max-w-[700px] h-[90vh] md:h-[85vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b">
                        <DialogTitle className="text-lg sm:text-xl">Créer un nouveau quiz</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                        <div className="bg-gray-50 px-4 sm:px-6 py-2 flex items-center justify-end">
                            <Button
                                type="button"
                                onClick={() => setShowAIGenerator(true)}
                                variant="outline"
                                className="bg-white border-purple-300 text-purple-700 hover:bg-purple-50"
                            >
                                <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                                Générer avec l'IA
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 px-4 sm:px-6 py-4">
                            <div className="space-y-4 sm:space-y-6">
                                <div className="grid gap-4">
                                    <div>
                                        <Label className="text-sm sm:text-base">Titre*</Label>
                                        <Input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm sm:text-base">Description</Label>
                                        <Textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="mt-1.5"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm sm:text-base">Disponible à partir de*</Label>
                                        <Input
                                            type="datetime-local"
                                            name="availableFrom"
                                            value={formData.availableFrom}
                                            onChange={handleInputChange}
                                            required
                                            min={new Date().toISOString().slice(0, 16)}
                                            className="mt-1.5"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm sm:text-base">Disponible jusqu'à</Label>
                                        <Input
                                            type="datetime-local"
                                            name="availableUntil"
                                            value={formData.availableUntil}
                                            onChange={handleInputChange}
                                            min={new Date(new Date(formData.availableFrom).getTime() + formData.timeLimit * 60000).toISOString().slice(0, 16)}
                                            className="mt-1.5"
                                        />
                                        {formData.availableUntil && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Le quiz sera disponible pendant {Math.round((new Date(formData.availableUntil) - new Date(formData.availableFrom)) / (1000 * 60 * 60))} heures
                                                {formData.timeLimit && (
                                                    <span> (Temps limite: {formData.timeLimit} minutes)</span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm sm:text-base">Temps limite (minutes)</Label>
                                    <Input
                                        type="number"
                                        name="timeLimit"
                                        value={formData.timeLimit}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="180"
                                        className="mt-1.5 w-24 sm:w-32"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <h3 className="text-base sm:text-lg font-medium">Questions</h3>
                                        <Button
                                            type="button"
                                            onClick={addQuestion}
                                            variant="outline"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Ajouter une question
                                        </Button>
                                    </div>

                                    <div className="space-y-4 sm:space-y-6">
                                        {formData.questions.map((question, qIndex) => (
                                            <Card key={qIndex} className="p-3 sm:p-4 relative">
                                                <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                    <div className="flex-1">
                                                        <Label className="text-sm sm:text-base">Question {qIndex + 1}*</Label>
                                                        <Input
                                                            value={question.text}
                                                            onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                                                            required
                                                            className="mt-1.5"
                                                        />
                                                    </div>
                                                    {formData.questions.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 h-8 w-8 sm:h-9 sm:w-9"
                                                            onClick={() => removeQuestion(qIndex)}
                                                        >
                                                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                                        <Label className="text-sm sm:text-base">Options de réponse</Label>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => addOption(qIndex)}
                                                            className="w-full sm:w-auto"
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Ajouter une option
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-2 sm:space-y-3">
                                                        {question.options.map((option, oIndex) => {
                                                            const hasDuplicate = question.options.some(
                                                                (opt, idx) => 
                                                                    idx !== oIndex && 
                                                                    opt.text.trim().toLowerCase() === option.text.trim().toLowerCase() && 
                                                                    option.text.trim() !== ""
                                                            );
                                                            
                                                            return (
                                                                <div
                                                                    key={oIndex}
                                                                    className={`flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap p-2 rounded-md ${
                                                                        option.isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-white border'
                                                                    } ${hasDuplicate ? 'border-red-500 bg-red-50' : ''}`}
                                                                >
                                                                    <div className="flex-1 min-w-[200px]">
                                                                        <Input
                                                                            value={option.text}
                                                                            onChange={(e) => handleQuestionChange(qIndex, `option-${oIndex}`, e.target.value)}
                                                                            placeholder={`Option ${oIndex + 1}`}
                                                                            required
                                                                            className={`${option.isCorrect ? 'border-green-300' : ''} ${
                                                                                hasDuplicate ? 'border-red-500' : ''
                                                                            }`}
                                                                        />
                                                                        {hasDuplicate && (
                                                                            <p className="text-xs text-red-500 mt-1">
                                                                                Cette réponse est en double
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 min-w-[120px]">
                                                                        <input
                                                                            type="radio"
                                                                            name={`correct-${qIndex}`}
                                                                            checked={option.isCorrect}
                                                                            onChange={() => handleQuestionChange(qIndex, `correct-${oIndex}`)}
                                                                            required
                                                                            className="w-4 h-4 accent-green-500"
                                                                        />
                                                                        <Label className={`text-sm ${option.isCorrect ? 'text-green-600 font-medium' : ''}`}>
                                                                            {option.isCorrect ? '✓ Réponse correcte' : 'Correcte'}
                                                                        </Label>
                                                                    </div>
                                                                    {question.options.length > 2 && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-red-500 shrink-0"
                                                                            onClick={() => removeOption(qIndex, oIndex)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
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
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto order-1 sm:order-2"
                                >
                                    {isSubmitting ? "Création..." : "Créer le quiz"}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {showAIGenerator && (
                <AIQuizGeneratorDialog
                    isOpen={showAIGenerator}
                    onClose={() => setShowAIGenerator(false)}
                    courseId={courseId}
                    chapterId={chapterId}
                    onQuizGenerated={handleAIQuizGenerated}
                />
            )}
        </>
    );
};

export default AddQuizDialog;