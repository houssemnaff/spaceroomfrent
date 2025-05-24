import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle, Check, Play } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const VIRTUAL_ROOMS = [
    "Salle  A",
    "Salle  B",
    "Salle  C"
];

export const CreateMeetingDialog = ({
    isOpen,
    setIsOpen,
    meetingForm,
    handleInputChange,
    handleCreateMeeting,
    isOperationLoading,
    resetForm,
}) => {
    const onClose = () => {
        setIsOpen(false);
        resetForm();
    };
  //  console.log("mettt",meetingForm.time);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Planifier une nouvelle réunion</DialogTitle>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                    <div>
                        <label htmlFor="title" className="text-sm font-medium block mb-2">
                            Titre de la réunion*
                        </label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Ex: Révision du chapitre 3"
                            value={meetingForm.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="text-sm font-medium block mb-2">
                                Date*
                            </label>
                            <Input
                                className="dark:bg-gray-800 dark:text-white"

                                id="date"
                                name="date"
                                type="date"
                                value={meetingForm.date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="time" className="text-sm font-medium block mb-2">
                                Heure*
                            </label>
                            <Input
                                className="dark:bg-gray-800 dark:text-white"
                                id="time"
                                name="time"
                                type="time"
                                value={meetingForm.time}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="duration" className="text-sm font-medium block mb-2">
                                Durée (minutes)*
                            </label>
                            <Input
                                className="dark:bg-gray-800 dark:text-white"

                                id="duration"
                                name="duration"
                                type="number"
                                min="15"
                                max="180"
                                value={meetingForm.duration}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="location" className="text-sm font-medium block mb-2">
                                Salle *
                            </label>
                            <select
                                id="location"
                                name="location"
                                value={meetingForm.location}
                                onChange={handleInputChange}
                                className="w-full rounded-md border border-input p-2 text-sm bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                required
                            >
                                {VIRTUAL_ROOMS.map(room => (
                                    <option key={room} value={room}>
                                        {room}
                                    </option>
                                ))}
                            </select>

                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="text-sm font-medium block mb-2">
                            Description
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Décrivez le but de cette réunion..."
                            value={meetingForm.description}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                        <Check className="h-4 w-4 text-blue-500" />
                        <AlertDescription className="text-blue-800">
                            La réunion sera accessible 15 minutes avant l'heure prévue pour les participants.
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isOperationLoading}>
                        Annuler
                    </Button>
                    <Button onClick={handleCreateMeeting} disabled={isOperationLoading}>
                        {isOperationLoading ? (
                            <span className="flex items-center">
                                <span className="animate-spin mr-2">↻</span>
                                Création...
                            </span>
                        ) : (
                            "Créer la réunion"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const InstantMeetingDialog = ({
    isOpen,
    setIsOpen,
    meetingForm,
    handleInputChange,
    handleCreateInstantMeeting,
    isOperationLoading,
    resetForm,
}) => {
    const onClose = () => {
        setIsOpen(false);
        resetForm();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Créer une réunion instantanée</DialogTitle>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                    <div>
                        <label htmlFor="title" className="text-sm font-medium block mb-2">
                            Titre de la réunion*
                        </label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Ex: Discussion rapide"
                            value={meetingForm?.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="text-sm font-medium block mb-2">
                            Description
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Détails supplémentaires..."
                            value={meetingForm?.description}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>

                    <div>
                        <label htmlFor="location" className="text-sm font-medium block mb-2">
                            Salle *
                        </label>
                        <select
                                id="location"
                                name="location"
                                value={meetingForm.location}
                                onChange={handleInputChange}
                                className="w-full rounded-md border border-input p-2 text-sm bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                required
                            >
                                {VIRTUAL_ROOMS.map(room => (
                                    <option key={room} value={room}>
                                        {room}
                                    </option>
                                ))}
                            </select>

                    </div>

                    <Alert className="bg-green-50 border-green-200">
                        <Play className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-800">
                            Vous serez redirigé vers la salle de réunion dès sa création.
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isOperationLoading}>
                        Annuler
                    </Button>
                    <Button onClick={handleCreateInstantMeeting} disabled={isOperationLoading}>
                        {isOperationLoading ? (
                            <span className="flex items-center">
                                <span className="animate-spin mr-2">↻</span>
                                Création...
                            </span>
                        ) : (
                            "Démarrer maintenant"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const EditMeetingDialog = ({
    isOpen,
    setIsOpen,
    meetingForm,
    handleInputChange,
    handleUpdateMeeting,
    isOperationLoading,
    resetForm,
}) => {
    const onClose = () => {
        setIsOpen(false);
        resetForm();
    };
   // console.log("edite ",meetingForm);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Modifier la réunion</DialogTitle>
                </DialogHeader>
                <div className="grid gap-5 py-4">
                    <div>
                        <label htmlFor="title" className="text-sm font-medium block mb-2">
                            Titre de la réunion*
                        </label>
                        <Input
                            id="title"
                            name="title"
                            value={meetingForm.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="text-sm font-medium block mb-2">
                                Date*
                            </label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                value={meetingForm.date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="time" className="text-sm font-medium block mb-2">
                                Heure*
                            </label>
                            <Input
                                id="time"
                                name="time"
                                type="time"
                                value={meetingForm.time}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="duration" className="text-sm font-medium block mb-2">
                                Durée (minutes)*
                            </label>
                            <Input
                                id="duration"
                                name="duration"
                                type="number"
                                min="15"
                                max="180"
                                value={meetingForm.duration}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="location" className="text-sm font-medium block mb-2">
                                Salle virtuelle*
                            </label>
                            <select
                                id="location"
                                name="location"
                                value={meetingForm.location}
                                onChange={handleInputChange}
                                className="w-full rounded-md border border-input p-2 text-sm"
                                required
                            >
                                {VIRTUAL_ROOMS.map(room => (
                                    <option key={room} value={room}>{room}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="text-sm font-medium block mb-2">
                            Description
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            value={meetingForm.description}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                        <Check className="h-4 w-4 text-blue-500" />
                        <AlertDescription className="text-blue-800">
                            Les modifications seront visibles pour tous les participants.
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isOperationLoading}>
                        Annuler
                    </Button>
                    <Button onClick={handleUpdateMeeting} disabled={isOperationLoading}>
                        {isOperationLoading ? (
                            <span className="flex items-center">
                                <span className="animate-spin mr-2">↻</span>
                                Mise à jour...
                            </span>
                        ) : (
                            "Enregistrer les modifications"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const DeleteMeetingDialog = ({
    isOpen,
    setIsOpen,
    meeting,
    handleDeleteMeeting,
    isOperationLoading,
   
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Supprimer la réunion</DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûr de vouloir supprimer cette réunion ? Cette action est irréversible.
                    </DialogDescription>
                </DialogHeader>

                {meeting && (
                    <div className="my-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium">{meeting.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {meeting.startTime} à {meeting.startTime}
                        </p>
                        {meeting.description && (
                            <p className="text-sm mt-2 line-clamp-2">{meeting.description}</p>
                        )}
                    </div>
                )}

                <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-amber-800">
                        Cette action supprimera définitivement la réunion et tous les participants en seront informés.
                    </AlertDescription>
                </Alert>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isOperationLoading}>
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteMeeting}
                        disabled={isOperationLoading}
                    >
                        {isOperationLoading ? (
                            <span className="flex items-center">
                                <span className="animate-spin mr-2">↻</span>
                                Suppression...
                            </span>
                        ) : (
                            "Supprimer définitivement"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};