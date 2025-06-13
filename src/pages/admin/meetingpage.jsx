import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { adminService } from "@/services/adminService";
import { toast } from "react-toastify";
import { Calendar, Clock, Users, Search, Video, Bookmark, User, MoreVertical, Edit, Trash2, CheckCircle } from "lucide-react";
import { format, addMinutes, isAfter, isBefore } from "date-fns";
import { fr } from "date-fns/locale";

const MeetingPage = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminService.getAllMeetings();
            setMeetings(response);
        } catch (error) {
            console.error("Error fetching meetings:", error);
            setError("Erreur lors de la récupération des réunions");
            toast.error("Erreur lors de la récupération des réunions", {
                containerId: "devoirs-toast"

            });
        } finally {
            setLoading(false);
        }
    };

    // Déterminer le statut d'une réunion en fonction de sa date et heure
    const getMeetingStatus = (meeting) => {
        const now = new Date();
        const startTime = new Date(meeting.startTime);
        const endTime = addMinutes(startTime, meeting.duration);

        if (meeting.recordingAvailable) {
            return "completed";
        } else if (isBefore(now, startTime)) {
            return "scheduled";
        } else if (isAfter(now, startTime) && isBefore(now, endTime)) {
            return "in_progress";
        } else if (isAfter(now, endTime)) {
            return "completed";
        }

        return "scheduled";
    };

    // Compter le nombre de réunions pour chaque statut
    const meetingCounts = {
        total: meetings.length,
        scheduled: meetings.filter(meeting => getMeetingStatus(meeting) === "scheduled").length,
        in_progress: meetings.filter(meeting => getMeetingStatus(meeting) === "in_progress").length,
        completed: meetings.filter(meeting => getMeetingStatus(meeting) === "completed").length
    };

    // Fonction pour supprimer une réunion
    const handleDeleteMeeting = async (meetingId) => {
            try {
                await adminService.deleteMeeting(meetingId);
                toast.success("Réunion supprimée avec succès", {
                    containerId: "devoirs-toast"

                });
                fetchMeetings(); // Rafraîchir la liste des réunions
            } catch (error) {
                console.error("Erreur lors de la suppression de la réunion:", error);
                toast.error("Erreur lors de la suppression de la réunion", {
                    containerId: "devoirs-toast"

                });
            }
        
    };

   

    const filteredMeetings = meetings.filter(meeting => {
        const meetingStatus = getMeetingStatus(meeting);
        const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (meeting.description && meeting.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "all" || meetingStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "scheduled":
                return "bg-blue-500";
            case "in_progress":
                return "bg-green-500";
            case "completed":
                return "bg-gray-500";
            default:
                return "bg-gray-500";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Date non définie";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Date invalide";
            }
            return format(date, "PPP", { locale: fr });
        } catch (error) {
            console.error("Erreur de formatage de date:", error);
            return "Date invalide";
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "Heure non définie";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Heure invalide";
            }
            return format(date, "p", { locale: fr });
        } catch (error) {
            console.error("Erreur de formatage d'heure:", error);
            return "Heure invalide";
        }
    };

    const calculateEndTime = (startTime, duration) => {
        if (!startTime || !duration) return "Heure non définie";
        try {
            const start = new Date(startTime);
            const end = addMinutes(start, duration);
            return formatTime(end);
        } catch (error) {
            console.error("Erreur de calcul de l'heure de fin:", error);
            return "Heure invalide";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestion des Réunions</h1>
                    <p className="text-muted-foreground mt-1">
                        Consultez et gérez toutes les réunions de la plateforme.
                    </p>
                </div>
            </div>

            {/* Cartes de statistiques des réunions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Carte pour le nombre total de réunions */}
                <Card className="bg-gradient-to-br from-purple-100 to-white dark:from-purple-950/20 dark:to-gray-950">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Réunions</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{meetingCounts.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Toutes les réunions
                        </p>
                    </CardContent>
                </Card>

                {/* Carte pour les réunions planifiées */}
                <Card className="bg-gradient-to-br from-blue-100 to-white dark:from-blue-950/20 dark:to-gray-950">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Planifiées</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{meetingCounts.scheduled}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Réunions à venir
                        </p>
                    </CardContent>
                </Card>

                {/* Carte pour les réunions en cours */}
                <Card className="bg-gradient-to-br from-green-100 to-white dark:from-green-950/20 dark:to-gray-950">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En cours</CardTitle>
                        <Clock className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{meetingCounts.in_progress}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Réunions actives maintenant
                        </p>
                    </CardContent>
                </Card>

                {/* Carte pour les réunions terminées */}
                <Card className="bg-gradient-to-br from-gray-100 to-white dark:from-gray-900/20 dark:to-gray-950">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Terminées</CardTitle>
                        <CheckCircle className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{meetingCounts.completed}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Réunions passées
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher une réunion..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="scheduled">Planifiée</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="completed">Terminée</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4">
                {filteredMeetings.map((meeting) => {
                    const status = getMeetingStatus(meeting);
                    return (
                        <Card key={meeting._id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">{meeting.title}</CardTitle>
                                    <CardDescription>{meeting.description || "Aucune description"}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(status)}>
                                        {status === "scheduled" && "Planifiée"}
                                        {status === "in_progress" && "En cours"}
                                        {status === "completed" && "Terminée"}
                                    </Badge>

                                    {/* Menu à trois points */}
                                    {/* Bouton de suppression direct */}
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteMeeting(meeting._id)}
                                        aria-label="Supprimer la réunion"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {formatDate(meeting.startTime)}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2" />
                                        {formatTime(meeting.startTime)} - {calculateEndTime(meeting.startTime, meeting.duration)}
                                    </div>
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        {meeting.hostName}
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-2" />
                                        {meeting.attendees?.length || 0} participants
                                    </div>
                                    {meeting.courseId && (
                                        <div className="flex items-center">
                                            <Bookmark className="h-4 w-4 mr-2" />
                                            {meeting.courseId.title || "Cours associé"}
                                        </div>
                                    )}
                                    {meeting.recordingAvailable && (
                                        <div className="flex items-center">
                                            <Badge variant="outline" className="bg-purple-100">Enregistrement disponible</Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {filteredMeetings.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Aucune réunion trouvée</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingPage;