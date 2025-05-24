import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminService } from "@/services/adminService";
import { toast } from "react-toastify";
import { FileText, Search, Plus, Download, File, Image, Video, MoreVertical, Calendar, Play, ExternalLink, X, BookOpen, Users, BarChart2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";


const VideoPopup = ({ url, onClose }) => {
    const getYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getYouTubeId(url);
    const isYouTube = videoId !== null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-6">
            <div className="relative w-full max-w-screen-xl bg-black rounded-2xl overflow-hidden shadow-lg">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
                >
                    <X className="h-7 w-7" />
                </button>

                <div className="aspect-video w-full h-full">
                    {isYouTube ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full rounded-b-2xl"
                            title="YouTube video player"
                        ></iframe>
                    ) : (
                        <video
                            controls
                            autoPlay
                            className="w-full h-full rounded-b-2xl"
                            src={url}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const RessourcePage = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [selectedResource, setSelectedResource] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [videoPopup, setVideoPopup] = useState({ open: false, url: '' });
    const [stats, setStats] = useState({
        total: 0,
        documents: 0,
        files: 0,
        videos: 0,
        downloads: 0
    });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const handleDeleteResource = async (resourceId) => {
        try {
            await adminService.deleteResource(resourceId);
            setResources(resources.filter(r => r._id !== resourceId));
            toast.success("Ressource supprimée avec succès", {
                containerId: "devoirs-toast"
        
              });

            // Mettre à jour les statistiques
            setStats(prev => ({
                ...prev,
                total: prev.total - 1,
                documents: resources.find(r => r._id === resourceId)?.type === 'pdf' ? prev.documents - 1 : prev.documents,
                files: resources.find(r => r._id === resourceId)?.type === 'file' ? prev.files - 1 : prev.files,
                videos: resources.find(r => r._id === resourceId)?.type === 'video' ? prev.videos - 1 : prev.videos,
                downloads: prev.downloads - (resources.find(r => r._id === resourceId)?.downloads || 0)
            }));
        } catch (error) {
            console.error("Error deleting resource:", error);
            toast.error("Erreur lors de la suppression de la ressource", {
                containerId: "devoirs-toast"
        
              });
        } finally {
            setIsDeleteDialogOpen(false);
            setResourceToDelete(null);
        }
    };

    const triggerDelete = (resource) => {
        setResourceToDelete(resource);
        setIsDeleteDialogOpen(true);
    };
    useEffect(() => {
        const fetchResourcesData = async () => {
            try {
                setLoading(true);
                setError(null);
                const resourcesData = await adminService.getAllResources();

                // Formatage des données des ressources
                const formattedResources = resourcesData.map(resource => ({
                    ...resource,
                    createdAt: resource.createdAt ? new Date(resource.createdAt) : null,
                    downloads: resource.downloads || 0,
                    type: resource.type || 'pdf'
                }));
                setResources(formattedResources);
                console.log("ressss ", resourcesData);

                // Calculer les statistiques à partir des ressources avec les bons types
                const stats = {
                    total: formattedResources.length,
                    documents: formattedResources.filter(r => r.type === 'pdf').length,
                    files: formattedResources.filter(r => r.type === 'file').length,
                    videos: formattedResources.filter(r => r.type === 'video').length,
                    downloads: formattedResources.reduce((acc, r) => acc + (r.downloads || 0), 0)
                };
                setStats(stats);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching resources:", error);
                setError("Erreur lors de la récupération des ressources");
                toast.error("Erreur lors de la récupération des ressources", {
                    containerId: "devoirs-toast"
            
                  });
                setLoading(false);
            }
        };

        fetchResourcesData();
    }, []);

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || resource.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getTypeIcon = (type) => {
        switch (type) {
            case "pdf":
                return <FileText className="h-4 w-4" />;
            case "file":
                return <File className="h-4 w-4" />;
            case "video":
                return <Video className="h-4 w-4" />;
            default:
                return <File className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case "pdf":
                return {
                    bg: "bg-blue-500",
                    text: "text-blue-500",
                    border: "border-l-blue-500",
                    iconBg: "bg-blue-500/10",
                    iconColor: "text-blue-500"
                };
            case "file":
                return {
                    bg: "bg-green-500",
                    text: "text-green-500",
                    border: "border-l-green-500",
                    iconBg: "bg-green-500/10",
                    iconColor: "text-green-500"
                };
            case "video":
                return {
                    bg: "bg-purple-500",
                    text: "text-purple-500",
                    border: "border-l-purple-500",
                    iconBg: "bg-purple-500/10",
                    iconColor: "text-purple-500"
                };
            default:
                return {
                    bg: "bg-gray-500",
                    text: "text-gray-500",
                    border: "border-l-gray-500",
                    iconBg: "bg-gray-500/10",
                    iconColor: "text-gray-500"
                };
        }
    };

    const formatDate = (dateString) => {
        try {
            if (!dateString) return "Date non spécifiée";
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Date invalide";
            return format(date, "PPP", { locale: fr });
        } catch (error) {
            console.error("Erreur de formatage de date:", error);
            return "Date invalide";
        }
    };

    const handleResourceClick = (resource) => {
        setSelectedResource(resource);
        setIsDialogOpen(true);
    };

    const handleViewResource = (resource) => {
        if (resource.type === "video") {
            setVideoPopup({ open: true, url: resource.url });
        } else if (resource.type === "image") {
            window.open(resource.url, "_blank");
        } else {
            // Pour les documents, on peut ajouter une logique de téléchargement
            const link = document.createElement('a');
            link.href = resource.url;
            link.download = resource.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestion des Ressources</h1>
                    <p className="text-muted-foreground mt-1">
                        Consultez et gérez toutes les ressources de la plateforme.
                    </p>
                </div>


            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total des ressources"
                    value={stats.total}
                    icon={<BookOpen size={18} />}
                    colour="red"
                />
                <StatCard
                    title="Documents PDF"
                    value={stats.documents}
                    icon={<FileText size={18} className="text-blue-500" />}
                    colour="blue"
                />
                <StatCard
                    title="Fichiers"
                    value={stats.files}
                    icon={<File size={18} className="text-green-500" />}
                    colour="green"
                />
                <StatCard
                    title="Vidéos"
                    value={stats.videos}
                    icon={<Video size={18} className="text-purple-500" />}
                    colour="purple"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher une ressource..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="pdf">Document PDF</SelectItem>
                        <SelectItem value="file">Fichier</SelectItem>
                        <SelectItem value="video">Vidéo</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4">
                {filteredResources.map((resource) => {
                    const colors = getTypeColor(resource.type);
                    return (
                        <Card
                            key={resource._id}
                            className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:shadow-md bg-white dark:bg-muted ${colors.border}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`shrink-0 rounded-full p-2 ${colors.iconBg} ${colors.iconColor}`}>
                                            {getTypeIcon(resource.type)}
                                        </div>
                                        <Badge variant="outline" className={colors.text}>
                                            {resource.type === "pdf" && "Document PDF"}
                                            {resource.type === "file" && "Fichier"}
                                            {resource.type === "video" && "Vidéo"}
                                        </Badge>
                                    </div>

                                    <p className="text-lg font-bold">{resource.name}</p>

                                    {resource.description && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {resource.description}
                                        </p>
                                    )}

                                    <div className="mt-4 flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(resource.createdAt)}
                                        </div>

                                        {resource.courseId && (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <BookOpen className="h-4 w-4" />
                                                {resource.courseId.title || "Cours associé"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleViewResource(resource)}
                                        className="h-8 w-8"
                                    >
                                        {resource.type === "video" ? (
                                            <Play className="h-4 w-4" />
                                        ) : resource.type === "image" ? (
                                            <Image className="h-4 w-4" />
                                        ) : (
                                            <Download className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleResourceClick(resource)}
                                        className="h-8 w-8"
                                    >
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    triggerDelete(resource);
                                                }}
                                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {filteredResources.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Aucune ressource trouvée</p>
                    </div>
                )}
            </div>


            {/* Delete confirmation dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Supprimer la ressource
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer la ressource "{resourceToDelete?.name}" ?
                            <br />
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDeleteResource(resourceToDelete?._id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            {videoPopup.open && (
                <VideoPopup
                    url={videoPopup.url}
                    onClose={() => setVideoPopup({ open: false, url: '' })}
                />
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon, colour = "red" }) => {
    // Mapping des couleurs valides pour Tailwind
    const colourMap = {
        red: "from-red-100",
        blue: "from-blue-100",
        green: "from-green-100",
        yellow: "from-yellow-100",
        purple: "from-purple-100",
        // Ajoutez d'autres couleurs au besoin
    };

    const gradientFrom = colourMap[colour] || "from-red-100";

    return (
        <Card className={`bg-gradient-to-br ${gradientFrom} to-white dark:from-blue-950/20 dark:to-gray-950`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon && (
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {icon}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
};

export default RessourcePage;
