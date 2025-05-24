import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Download, Calendar, BarChart2, TrendingUp, Users, Clock, ArrowUpRight, Award } from "lucide-react";
import { adminService } from "@/services/adminService";
import { toast } from "react-toastify";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [retentionData, setRetentionData] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Charger les stats du tableau de bord
        const stats = await adminService.getDashboardStats();
        setDashboardStats(stats);
        
        // Charger les données d'activité
        const activity = await adminService.getActivityHeatmap();
        setActivityData(formatActivityData(activity));
        
        // Charger les données d'engagement
        const engagement = await adminService.getStudentEngagement();
        setEngagementData(formatEngagementData(engagement));
        
        // Charger la distribution des notes
        const grades = await adminService.getGradeDistribution();
        setRetentionData(formatRetentionData(grades));
        
        // Charger les cours populaires
        const courses = await adminService.getPopularCourses(5);
        setPopularCourses(formatPopularCourses(courses));
        
        // Charger les meilleurs étudiants
        const students = await adminService.getTopStudents(4);
        setTopStudents(students);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Une erreur est survenue lors du chargement des données');
        toast.error(err.message || 'Une erreur est survenue lors du chargement des données');
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  const formatActivityData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      hour: item.hour,
      users: item.count || 0
    }));
  };

  const formatEngagementData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      month: item.month,
      sessions: item.sessions || 0,
      duration: item.duration || 0
    }));
  };

  const formatRetentionData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      name: item.range,
      taux: item.percentage || 0
    }));
  };

  const formatPopularCourses = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(course => ({
      name: course.title,
      value: course.enrolledStudents || 0
    }));
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
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord analytique</h1>
          <p className="text-muted-foreground mt-1">
            Visualisez les tendances et performances de la plateforme
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Derniers 30 jours
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions quotidiennes</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.dailySessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium inline-flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +{dashboardStats?.sessionGrowth || 0}%
              </span>{" "}
              vs semaine précédente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium inline-flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +{dashboardStats?.userGrowth || 0}%
              </span>{" "}
              vs semaine précédente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.averageTime || "0"} min</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium inline-flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +{dashboardStats?.timeGrowth || 0}%
              </span>{" "}
              vs semaine précédente
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="retention">Rétention</TabsTrigger>
          <TabsTrigger value="courses">Cours</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité par heure</CardTitle>
              <CardDescription>
                Nombre d'utilisateurs actifs par tranche horaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution de l'engagement</CardTitle>
              <CardDescription>
                Nombre de sessions et durée moyenne par mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sessions"
                      stroke="#8884d8"
                      name="Sessions"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="duration"
                      stroke="#82ca9d"
                      name="Durée (min)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Taux de rétention</CardTitle>
              <CardDescription>
                Pourcentage d'utilisateurs qui reviennent sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={retentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="taux"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 des cours</CardTitle>
                <CardDescription>
                  Cours les plus populaires par nombre d'inscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={popularCourses}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {popularCourses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meilleurs étudiants</CardTitle>
                <CardDescription>
                  Étudiants avec les meilleures performances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topStudents.map((student, index) => (
                    <div key={index} className="flex items-center p-2 rounded-md hover:bg-muted">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-3">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{student.name}</p>
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-muted-foreground flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" /> {student.completedCourses || 0} cours complétés
                          </div>
                        </div>
                      </div>
                      <div className="font-medium text-sm flex items-center text-amber-500">
                        {student.averageScore?.toFixed(1) || "0.0"}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 ml-1"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;