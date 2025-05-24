import { useState, useEffect } from "react";
import { Trash, Search, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import services
import { adminService } from "@/services/adminService";
import { deleteUserById } from "@/services/userapi";
import { useAuth } from "../auth/authContext";

const Utilisateurs = () => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    etudiants: 0,
    enseignants: 0,
    administrateurs: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [userDetails, setUserDetails] = useState(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use admin service to get users data
        const usersData = await adminService.getAllUsersWithStats();

        setUsers(usersData);
        
        // Calcul correct des statistiques
        const totalUsers = usersData.length || 0;
        const students = usersData.filter(user => user.role === "user" && user.enrolledCourses > 0).length || 0;
        const teachers = usersData.filter(user => user.role === "user" && user.createdCourses > 0).length || 0;
        const admins = usersData.filter(user => user.role === "admin").length || 0;
        
        setStats({
          total: totalUsers,
          etudiants: students,
          enseignants: teachers,
          administrateurs: admins
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching users data:", error);
        setError("Impossible de charger les données des utilisateurs. Veuillez réessayer.");
        setLoading(false);
      }
    };

    fetchUsersData();
  }, []);

  const handleViewUserDetails = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Get user details
      const details = await adminService.getUserStats(userId);

      setUserDetails(details);
      console.log("user detail", details);
      setShowUserDetailsModal(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Impossible de charger les détails de l'utilisateur. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const handleDeleteClick = (user, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    // Empêcher la suppression des administrateurs
    if (user.role === "admin") {
      toast.error("Les administrateurs ne peuvent pas être supprimés.", {
        containerId: "devoirs-toast"

      });
      return;
    }
    
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleteDialogOpen(false);
    const userName = userToDelete.name;
    const userId = userToDelete._id;

    setUserToDelete(null);

    try {
      setLoading(true);
      await adminService.deleteuser(userId, token);

      // Mettre à jour la liste des utilisateurs
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      
      // Fermer la modal de détails si elle est ouverte
      setShowUserDetailsModal(false);
      
      // Mettre à jour les statistiques après suppression
      setStats(prevStats => ({
        ...prevStats,
        total: prevStats.total - 1,
        etudiants: userToDelete.role === "user" && userToDelete.enrolledCourses > 0 ? prevStats.etudiants - 1 : prevStats.etudiants,
        enseignants: userToDelete.role === "user" && userToDelete.createdCourses > 0 ? prevStats.enseignants - 1 : prevStats.enseignants,
        administrateurs: userToDelete.role === "admin" ? prevStats.administrateurs - 1 : prevStats.administrateurs
      }));

      
        toast.success(`L'utilisateur "${userName}" a été supprimé avec succès.`, {
          containerId: "devoirs-toast"
  
        });
   
    } catch (error) {
      console.error("Erreur de suppression:", error.message);
    
        toast.error("Impossible de supprimer l'utilisateur. Veuillez réessayer.", {
          containerId: "devoirs-toast"
  
        });
     
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    // Filter by search query
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by tab
    let matchesTab = true;
    if (activeTab === "students") {
      // Afficher uniquement les étudiants inscrits à au moins un cours
      matchesTab = user.role === "user" && (user.enrolledCourses > 0);
    }
    else if (activeTab === "teachers") {
      // Afficher uniquement les utilisateurs qui ont créé au moins un cours
      matchesTab = user.role === "user" && (user.createdCourses > 0);
    }
    else if (activeTab === "admins") {
      matchesTab = user.role === "admin";
    }

    return matchesSearch && matchesTab;
  });

  const getInitials = (name) => {
    if (!name) return "??";
    const names = name.split(" ");
    return names.map(n => n.charAt(0)).join("").toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "user":
        return "bg-cours text-white";
      case "teacher":
        return "bg-progression text-white";
      case "admin":
        return "bg-alerte text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case "user":
        return "Étudiant";
      case "teacher":
        return "Enseignant";
      case "admin":
        return "Administrateur";
      default:
        return role;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Détermine si l'icône de détails doit être affichée pour un utilisateur donné
  const shouldShowDetailsIcon = (user) => {
    // Ne pas afficher l'icône de détails pour les administrateurs
    return user.role !== "admin";
  };

  // Détermine si le bouton de suppression doit être activé pour un utilisateur donné
  const isDeleteButtonDisabled = (user) => {
    // Désactiver la suppression pour les administrateurs
    return user.role === "admin";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-3xl font-bold mb-2">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground">Liste des utilisateurs de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-100 to-white dark:from-blue-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-100 to-white dark:from-blue-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants inscrits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.etudiants}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-100 to-white dark:from-blue-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enseignants}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-100 to-white dark:from-blue-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.administrateurs}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <TabsList className="h-9">
              <TabsTrigger value="all">Tous les utilisateurs</TabsTrigger>
              <TabsTrigger value="students">Étudiants</TabsTrigger>
              <TabsTrigger value="teachers">Enseignants</TabsTrigger>
              <TabsTrigger value="admins">Administrateurs</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="relative w-full sm:w-[300px]">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Cours inscrits</TableHead>
                  <TableHead>Cours créés</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {user.imageurl ? (
                              <AvatarImage src={user.imageurl} alt={user.name} />
                            ) : (
                              <AvatarFallback className={getRoleColor(user.role)}>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-normal ${user.role === "admin" ? "border-alerte text-alerte" : user.role === "teacher" ? "border-progression text-progression" : "border-cours text-cours"}`}>
                          {getRoleName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.enrolledCourses || 0}</TableCell>
                      <TableCell>{user.createdCourses || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          {/* Afficher l'icône de détails uniquement pour les non-administrateurs */}
                          {shouldShowDetailsIcon(user) && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleViewUserDetails(user._id)}
                              title="Voir détails"
                            >
                              <Eye size={16} />
                            </Button>
                          )}
                          
                          {/* Désactiver le bouton de suppression pour les administrateurs */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => handleDeleteClick(user, e)}
                            title={isDeleteButtonDisabled(user) ? "Les administrateurs ne peuvent pas être supprimés" : "Supprimer l'utilisateur"}
                            className={`${isDeleteButtonDisabled(user) ? "text-gray-400 cursor-not-allowed" : "text-red-500 hover:text-red-700"}`}
                            disabled={isDeleteButtonDisabled(user)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Tabs>
      </Card>

      {/* Modal for user details */}
      {userDetails && (
        <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Détails de l'utilisateur</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-24 h-24">
                  {userDetails.userInfo.imageurl ? (
                    <AvatarImage src={userDetails.userInfo.imageurl} alt={userDetails.userInfo.name} />
                  ) : (
                    <AvatarFallback className={`text-xl ${getRoleColor(userDetails.userInfo.role)}`}>
                      {getInitials(userDetails.userInfo.name)}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="text-center">
                  <h2 className="text-xl font-bold">{userDetails.userInfo.name}</h2>
                  <p className="text-sm text-muted-foreground">{userDetails.userInfo.email}</p>
                  <Badge variant="outline" className={`mt-2 font-normal ${userDetails.userInfo.role === "admin" ? "border-alerte text-alerte" : userDetails.userInfo.role === "teacher" ? "border-progression text-progression" : "border-cours text-cours"}`}>
                    {getRoleName(userDetails.userInfo.role)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-3">
                  <p className="text-sm text-muted-foreground">Cours inscrits</p>
                  <p className="text-xl font-bold">{userDetails.metrics.coursesEnrolled}</p>
                </div>
                <div className="border rounded p-3">
                  <p className="text-sm text-muted-foreground">Cours créés</p>
                  <p className="text-xl font-bold">{userDetails.metrics.coursesCreated}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Membre depuis</p>
                <p>{formatDate(userDetails.userInfo.createdAt)}</p>
                <p className="text-sm text-muted-foreground mt-2">Dernière activité</p>
                <p>{formatDate(userDetails.userInfo.lastActive)}</p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowUserDetailsModal(false)}>
                  Fermer
                </Button>
                {/* Désactiver le bouton de suppression pour les administrateurs dans la modal */}
                {!isDeleteButtonDisabled(userDetails.userInfo) && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteClick(userDetails.userInfo)}
                  >
                    <Trash size={16} className="mr-2" />
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer l'utilisateur
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur "{userToDelete?.name}" ?
              <br />
              Cette action est irréversible et supprimera toutes les données associées à cet utilisateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        limit={3}
      />
    </div>
  );
};

export default Utilisateurs;