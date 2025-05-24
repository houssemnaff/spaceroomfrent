import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  Filter,
  PlusCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Users,
  User,
  BarChart2,
  Award,
  TrendingUp,
  Clock,
  Plus,
  Download,
  Eye,
  EyeOff,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/adminService";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Courses = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [courseStats, setCourseStats] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    enrolledStudents: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("courses");

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    courseId: null,
    courseName: ""
  });

  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        setLoading(true);
        const coursesData = await adminService.getAllCoursesWithStats();

        // Calculate stats from the courses data
        const stats = {
          total: coursesData.length || 0,
          published: coursesData.filter(course => course.isPublished).length || 0,
          draft: coursesData.filter(course => !course.isPublished).length || 0,
          enrolledStudents: coursesData.reduce((acc, course) => acc + (course.studentCount || 0), 0) || 0,
          averageRating: coursesData.reduce((acc, course) => acc + (course.averageScore || 0), 0) / (coursesData.length || 1)
        };

        // Create detailed stats object from the courses data
        const detailedStats = {};
        coursesData.forEach(course => {
          detailedStats[course._id] = {
            enrolledStudents: course.studentCount || 0,
            averageProgress: course.activityCount > 0 ? (course.activityCount / (course.studentCount || 1)) * 100 : 0,
            averageRating: course.averageScore || 0,
            chapterCount: course.chapterCount || 0,
            quizCount: course.quizCount || 0,
            assignmentCount: course.assignmentCount || 0,
            meetingCount: course.meetingCount || 0
          };
        });

        setCourses(coursesData);
        setCourseStats(detailedStats);
        setStats(stats);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses data:", error);
        toast.error(error.message || "Erreur lors du chargement des cours", {
          containerId: "devoirs-toast"

        });
        setError(error.message || "Erreur lors du chargement des cours");
        setLoading(false);
      }
    };

    fetchCoursesData();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" ||
      (selectedStatus === "published" && course.isPublished) ||
      (selectedStatus === "draft" && !course.isPublished);
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (isPublished) => {
    return isPublished ? "bg-green-500 text-white" : "bg-yellow-500 text-white";
  };

  const getStatusLabel = (isPublished) => {
    return isPublished ? "Publié" : "Brouillon";
  };

  const getSubjectColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'mathématiques':
        return {
          bg: "bg-gradient-to-br from-blue-500 to-blue-600",
          text: "text-blue-600",
          border: "border-blue-500",
          icon: "text-blue-500",
          hover: "hover:from-blue-600 hover:to-blue-700"
        };
      case 'littérature':
        return {
          bg: "bg-gradient-to-br from-purple-500 to-purple-600",
          text: "text-purple-600",
          border: "border-purple-500",
          icon: "text-purple-500",
          hover: "hover:from-purple-600 hover:to-purple-700"
        };
      case 'sciences':
        return {
          bg: "bg-gradient-to-br from-green-500 to-green-600",
          text: "text-green-600",
          border: "border-green-500",
          icon: "text-green-500",
          hover: "hover:from-green-600 hover:to-green-700"
        };
      case 'langues':
        return {
          bg: "bg-gradient-to-br from-orange-500 to-orange-600",
          text: "text-orange-600",
          border: "border-orange-500",
          icon: "text-orange-500",
          hover: "hover:from-orange-600 hover:to-orange-700"
        };
      default:
        return {
          bg: "bg-gradient-to-br from-gray-500 to-gray-600",
          text: "text-gray-600",
          border: "border-gray-500",
          icon: "text-gray-500",
          hover: "hover:from-gray-600 hover:to-gray-700"
        };
    }
  };


  const handleDeleteClick = (courseId, courseName) => {
    setDeleteDialog({
      open: true,
      courseId,
      courseName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.courseId) return;

    try {
      await adminService.deleteCourse(deleteDialog.courseId);
      toast.success("Cours supprimé avec succès", {
        containerId: "devoirs-toast"
      });
      setCourses(courses.filter(course => course._id !== deleteDialog.courseId));
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Erreur lors de la suppression du cours", {
        containerId: "devoirs-toast"
      });
    } finally {
      setDeleteDialog({ open: false, courseId: null, courseName: "" });
    }
  };

  const getCategoryStats = () => {
    const stats = {};
    courses.forEach(course => {
      const category = course.category || 'Non spécifié';
      stats[category] = (stats[category] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({
      name,
      value
    }));
  };

  const getTopCourses = () => {
    // Trier les cours par nombre d'étudiants
    const sortedCourses = [...courses].sort((a, b) => {
      const studentsA = a.students?.length || 0;
      const studentsB = b.students?.length || 0;
      return studentsB - studentsA;
    });

    // Prendre les 5 premiers cours
    const top5 = sortedCourses.slice(0, 5);

    // Transformer en format pour le graphique
    return top5.map(course => ({
      name: course.title,
      value: course.students?.length || 0
    }));
  };

  const getCoursesProgressData = () => {
    return courses.slice(0, 8).map(course => ({
      name: course.title.length > 12 ? course.title.substring(0, 12) + '...' : course.title,
      progress: course.progress || 0
    }));
  };

  const getPublishedVsDraftData = () => {
    return [
      { name: 'Publiés', value: stats.published },
      { name: 'Brouillons', value: stats.draft }
    ];
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getCourseProgress = (courseId) => {
    const stats = courseStats[courseId];
    if (!stats) return 0;
    return Math.round(stats.averageProgress);
  };

  const getCourseStudents = (courseId) => {
    const stats = courseStats[courseId];
    if (!stats) return 0;
    return stats.enrolledStudents;
  };

  const getCourseRating = (courseId) => {
    const stats = courseStats[courseId];
    if (!stats) return 0;
    return stats.averageRating;
  };

  const getCourseDetails = (courseId) => {
    const stats = courseStats[courseId];
    if (!stats) return {
      chapters: 0,
      quizzes: 0,
      assignments: 0,
      meetings: 0
    };
    return {
      chapters: stats.chapterCount,
      quizzes: stats.quizCount,
      assignments: stats.assignmentCount,
      meetings: stats.meetingCount
    };
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
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Cours</h1>
          <p className="text-muted-foreground mt-1">
            Gérez et suivez les cours de la plateforme.
          </p>
        </div>


      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">




        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-2">
            <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total des cours</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>


            <Card className="bg-gradient-to-br from-red-50 to-white dark:from-blue-950/20 dark:to-gray-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Étudiants inscrits</CardTitle>
                <Users className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.enrolledStudents}</div>
              </CardContent>
            </Card>



          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un cours..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">




              <Tabs value={viewMode} onValueChange={setViewMode} className="hidden sm:block">
                <TabsList className="h-10">
                  <TabsTrigger value="grid" className="px-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="px-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M8 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M8 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M3 6H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M3 12H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const colors = getSubjectColor(course.category);
                const courseDetailStats = courseStats[course._id];
                return (
                  <Card
                    key={course._id}
                    className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${colors.border}`}
                  >
                    <div className={`h-2 ${colors.bg} transition-all duration-300 ${colors.hover}`} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-semibold">{course.title}</CardTitle>
                          <CardDescription className="mt-1">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {course.owner || "Instructeur non spécifié"}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(course._id, course.title)}
                            >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between mb-3">


                      </div>

                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">class</span>
                          <Badge variant="outline" className={`${colors.text} ${colors.border}`}>
                            {course.description || "Non spécifié"}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Étudiants</span>
                          <span className="font-medium">{getCourseStudents(course._id)}</span>
                        </div>


                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div className="flex items-center gap-1 text-sm">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span>{getCourseDetails(course._id).chapters} chapitres</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Award className="h-4 w-4 text-purple-500" />
                            <span>{getCourseDetails(course._id).quizzes} quiz</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <FileText className="h-4 w-4 text-green-500" />
                            <span>{getCourseDetails(course._id).assignments} devoirs</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <span>{getCourseDetails(course._id).meetings} réunions</span>
                          </div>
                        </div>


                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Créé le: {format(new Date(course.createdAt), "dd MMM yyyy", { locale: fr })}
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}

              {filteredCourses.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  <BookOpen className="mx-auto h-12 w-12 opacity-30 mb-4" />
                  <h3 className="text-lg font-medium mb-1">Aucun cours trouvé</h3>
                  <p>Essayez de modifier vos critères de recherche ou créez un nouveau cours.</p>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 p-4 text-sm font-medium border-b bg-muted/50">
                    <div className="col-span-5">Cours</div>
                    <div className="col-span-3 hidden md:block">Instructeur</div>
                    <div className="col-span-2 text-center">Étudiants</div>
                    <div className="col-span-4 md:col-span-2 text-right">Catégorie</div>
                  </div>

                  {filteredCourses.map((course) => {
                    const courseDetailStats = courseStats[course._id];
                    return (
                      <div
                        key={course._id}
                        className="grid grid-cols-12 p-4 text-sm items-center border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                      >
                        <div className="col-span-5 flex items-center gap-3">
                          <div className={cn("p-2 rounded-md", getSubjectColor(course.category).bg.replace("from-", "").replace("to-", "").split(" ")[0])}>
                            <BookOpen className={getSubjectColor(course.category).icon} />
                          </div>
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="flex items-center gap-1 text-muted-foreground mt-1 text-xs">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(course.createdAt), "dd MMM yyyy", { locale: fr })}
                            </div>
                          </div>
                        </div>

                        <div className="col-span-3 hidden md:block">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {course.owner || "Instructeur non spécifié"}
                          </div>
                        </div>

                        <div className="col-span-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-3 w-3" />
                            {getCourseStudents(course._id)}
                          </div>
                        </div>

                        <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(course._id, course.title)}
                            >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  

                  {filteredCourses.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <BookOpen className="mx-auto h-12 w-12 opacity-30 mb-4" />
                      <h3 className="text-lg font-medium mb-1">Aucun cours trouvé</h3>
                      <p>Essayez de modifier vos critères de recherche ou créez un nouveau cours.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>


      </Tabs>
      // Ajoutez ce composant de dialogue quelque part dans votre JSX principal
<Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({...deleteDialog, open})}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmer la suppression</DialogTitle>
    </DialogHeader>
    <div className="py-4">
      Êtes-vous sûr de vouloir supprimer le cours "{deleteDialog.courseName}" ?
      Cette action est irréversible.
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setDeleteDialog({...deleteDialog, open: false})}>
        Annuler
      </Button>
      <Button 
        variant="destructive" 
        onClick={handleDeleteConfirm}
        className="ml-2"
      >
        Supprimer
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
    
  );
  
};


export default Courses;