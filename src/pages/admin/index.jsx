import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer
} from "recharts";
import { 
  Users, Book, FileText, Video, Calendar, 
  GraduationCap, Activity, BookOpen, Download,
  Award
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Données principales
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Stats calculées
  const [monthlyActivity, setMonthlyActivity] = useState([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    admins: 0,
    students: 0,
    active: 0
  });
  const [courseStats, setCourseStats] = useState({
    total: 0,
    avgStudents: 0,
    avgScore: 0
  });

  // Stats globales
  const [counts, setCounts] = useState({
    users: 0,
    courses: 0,
    chapters: 0,
    quizzes: 0,
    assignments: 0,
    resources: 0,
    meetings: 0,
    submissions: 0,
    quizAttempts: 0
  });

  // Couleurs pour les graphiques
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Récupérer les totaux
        const totalCounts = await adminService.getTotalCounts();
        setCounts(totalCounts);
        
        // Récupérer les données brutes
        const [usersData, coursesData] = await Promise.all([
          adminService.getAllUsersWithStats(),
          adminService.getAllCoursesWithStats()
        ]);

        setUsers(usersData);
        setCourses(coursesData);

        // Calculer les stats des utilisateurs
        const userStats = {
          total: usersData.length,
          admins: usersData.filter(u => u.role === 'admin').length,
          students: usersData.filter(u => u.role === 'user').length,
          active: usersData.filter(u => 
            new Date(u.lastActive) > new Date(Date.now() - 30*24*60*60*1000)
          ).length
        };
        setUserStats(userStats);

        // Calculer les stats des cours
        const courseStats = {
          total: coursesData.length,
          avgStudents: coursesData.reduce((sum, course) => sum + course.studentCount, 0) / coursesData.length,
          avgScore: coursesData.reduce((sum, course) => sum + (course.averageScore || 0), 0) / coursesData.length
        };
        setCourseStats(courseStats);

        // Calculer l'activité mensuelle
        calculateMonthlyActivity(usersData, coursesData);

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError(error.message || "Erreur lors du chargement des données");
        toast.error(error.message || "Erreur lors du chargement des données ❌");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateMonthlyActivity = (users, courses) => {
    const months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    
    const currentYear = new Date().getFullYear();
    const monthlyData = months.map((month, index) => {
      // Filtrer les utilisateurs créés ce mois
      const monthUsers = users.filter(user => {
        const date = new Date(user.createdAt);
        return date.getFullYear() === currentYear && date.getMonth() === index;
      });

      // Filtrer les cours créés ce mois
      const monthCourses = courses.filter(course => {
        const date = new Date(course.createdAt);
        return date.getFullYear() === currentYear && date.getMonth() === index;
      });

      return {
        name: month,
        users: monthUsers.length,
        courses: monthCourses.length,
        students: monthCourses.reduce((sum, course) => sum + course.studentCount, 0)
      };
    });

    setMonthlyActivity(monthlyData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 md:p-6">
      <ToastContainer />
      
      
      {/* Vue Unifiée - Combinaison des sections essentielles */}
      <div className="space-y-6">
        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.users}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Étudiants et administrateurs
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cours</CardTitle>
              <Book className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.courses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {counts.chapters} chapitres au total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ressources</CardTitle>
              <FileText className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.resources}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Documents, vidéos et liens
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quiz</CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.quizzes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {counts.quizAttempts} tentatives
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réunions</CardTitle>
              <Video className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.meetings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Sessions en direct
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Devoirs</CardTitle>
              <Award className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.assignments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {counts.submissions} soumissions
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Activité mensuelle */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Activité mensuelle ({new Date().getFullYear()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyActivity}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3b82f6" 
                    name="Nouveaux utilisateurs" 
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="courses" 
                    stroke="#10b981" 
                    name="Nouveaux cours" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Graphiques de répartition - 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          

          {/* Répartition des étudiants par cours */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                Répartition des étudiants par cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courses
                        .sort((a, b) => b.studentCount - a.studentCount)
                        .slice(0, 5)
                        .map(course => ({
                          name: course.title,
                          value: course.studentCount
                        }))
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} étudiants`]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
           {/* Répartition des cours par utilisateur */}
           <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                Répartition des cours par utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={users
                        .filter(user => user.role === 'user')
                        .map(user => ({
                          name: user.name,
                          value: user.enrolledCourses + user.createdCourses || 0
                        }))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 5)
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value} cours`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} cours`]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        </div>
        
       
        
        {/* Derniers cours créés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="h-5 w-5 mr-2 text-blue-500" />
              Derniers cours créés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map(course => (
                  <div key={course._id} className="flex items-center gap-4 p-2 border rounded-lg">
                    <img 
                      src={course.imageurl} 
                      alt={course.title} 
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {course.studentCount} étudiants • Créé le {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;