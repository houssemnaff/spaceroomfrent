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
     // console.log("user detail", details);
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
        return "flex items-center justify-center h-8 w-8 rounded-full bg-cours text-black dark:text-white";
      case "admin":
        return "flex items-center justify-center h-8 w-8 rounded-full bg-cours text-black dark:text-white";
      default:
        return "flex items-center justify-center h-8 w-8 rounded-full bg-cours text-black dark:text-white";
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
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Gestion des Utilisateurs</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Liste des utilisateurs de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <Card className="bg-gradient-to-br from-blue-100 to-white dark:from-blue-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total utilisateurs</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-100 to-white dark:from-blue-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Étudiants inscrits</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{stats.etudiants}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-100 to-white dark:from-blue-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Enseignants</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{stats.enseignants}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-100 to-white dark:from-blue-950/20 dark:to-gray-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Administrateurs</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{stats.administrateurs}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-3 sm:p-6">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 mb-4 sm:mb-6">
  <div className="overflow-x-auto">
    <TabsList className="h-9 w-full sm:w-auto flex justify-start">
      <TabsTrigger value="all" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">Tous</TabsTrigger>
      <TabsTrigger value="students" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">Étudiants</TabsTrigger>
      <TabsTrigger value="teachers" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">Enseignants</TabsTrigger>
      <TabsTrigger value="admins" className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4">Admins</TabsTrigger>
    </TabsList>
  </div>
</div>

          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-10 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Version Desktop - Table */}
          <div className="hidden md:block rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">Utilisateur</TableHead>
                  <TableHead className="text-sm">Rôle</TableHead>
                  <TableHead className="text-sm">Cours inscrits</TableHead>
                  <TableHead className="text-sm">Cours créés</TableHead>
                  <TableHead className="w-[120px] text-right text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                            {user.imageurl ? (
                              <AvatarImage src={user.imageurl} alt={user.name} />
                            ) : (
                              <AvatarFallback className={getRoleColor(user.role)}>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm lg:text-base">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-normal text-xs ${user.role === "admin" ? "border-alerte text-alerte" : user.role === "teacher" ? "border-progression text-progression" : "border-cours text-cours"}`}>
                          {getRoleName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{user.enrolledCourses || 0}</TableCell>
                      <TableCell className="text-sm">{user.createdCourses || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          {shouldShowDetailsIcon(user) && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleViewUserDetails(user._id)}
                              title="Voir détails"
                              className="w-8 h-8"
                            >
                              <Eye size={14} />
                            </Button>
                          )}
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => handleDeleteClick(user, e)}
                            title={isDeleteButtonDisabled(user) ? "Les administrateurs ne peuvent pas être supprimés" : "Supprimer l'utilisateur"}
                            className={`w-8 h-8 ${isDeleteButtonDisabled(user) ? "text-gray-400 cursor-not-allowed" : "text-red-500 hover:text-red-700"}`}
                            disabled={isDeleteButtonDisabled(user)}
                          >
                            <Trash size={14} />
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

          {/* Version Mobile - Cards */}
          <div className="md:hidden space-y-3">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Card key={user._id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        {user.imageurl ? (
                          <AvatarImage src={user.imageurl} alt={user.name} />
                        ) : (
                          <AvatarFallback className={getRoleColor(user.role)}>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <Badge variant="outline" className={`mt-1 font-normal text-xs ${user.role === "admin" ? "border-alerte text-alerte" : user.role === "teacher" ? "border-progression text-progression" : "border-cours text-cours"}`}>
                          {getRoleName(user.role)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      {shouldShowDetailsIcon(user) && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleViewUserDetails(user._id)}
                          title="Voir détails"
                          className="w-8 h-8"
                        >
                          <Eye size={14} />
                        </Button>
                      )}
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleDeleteClick(user, e)}
                        title={isDeleteButtonDisabled(user) ? "Les administrateurs ne peuvent pas être supprimés" : "Supprimer l'utilisateur"}
                        className={`w-8 h-8 ${isDeleteButtonDisabled(user) ? "text-gray-400 cursor-not-allowed" : "text-red-500 hover:text-red-700"}`}
                        disabled={isDeleteButtonDisabled(user)}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Cours inscrits</p>
                      <p className="text-sm font-semibold">{user.enrolledCourses || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Cours créés</p>
                      <p className="text-sm font-semibold">{user.createdCourses || 0}</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">Aucun utilisateur trouvé</p>
              </Card>
            )}
          </div>
        </Tabs>
      </Card>

      {/* Modal for user details */}
      {userDetails && (
        <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
          <DialogContent className="max-w-sm sm:max-w-md mx-2 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Détails de l'utilisateur</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                  {userDetails.userInfo.imageurl ? (
                    <AvatarImage src={userDetails.userInfo.imageurl} alt={userDetails.userInfo.name} />
                  ) : (
                    <AvatarFallback className={`text-lg sm:text-xl ${getRoleColor(userDetails.userInfo.role)}`}>
                      {getInitials(userDetails.userInfo.name)}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="text-center">
                  <h2 className="text-lg sm:text-xl font-bold">{userDetails.userInfo.name}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">{userDetails.userInfo.email}</p>
                  <Badge variant="outline" className={`mt-2 font-normal text-xs ${userDetails.userInfo.role === "admin" ? "border-alerte text-alerte" : userDetails.userInfo.role === "teacher" ? "border-progression text-progression" : "border-cours text-cours"}`}>
                    {getRoleName(userDetails.userInfo.role)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="border rounded p-3 text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">Cours inscrits</p>
                  <p className="text-lg sm:text-xl font-bold">{userDetails.metrics.coursesEnrolled}</p>
                </div>
                <div className="border rounded p-3 text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">Cours créés</p>
                  <p className="text-lg sm:text-xl font-bold">{userDetails.metrics.coursesCreated}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Membre depuis</p>
                  <p className="text-sm sm:text-base">{formatDate(userDetails.userInfo.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Dernière activité</p>
                  <p className="text-sm sm:text-base">{formatDate(userDetails.userInfo.lastActive)}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-2">
                <Button variant="outline" onClick={() => setShowUserDetailsModal(false)} className="text-sm">
                  Fermer
                </Button>
                {!isDeleteButtonDisabled(userDetails.userInfo) && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteClick(userDetails.userInfo)}
                    className="text-sm"
                  >
                    <Trash size={14} className="mr-2" />
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
        <AlertDialogContent className="max-w-sm sm:max-w-md mx-2 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              Supprimer l'utilisateur
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Êtes-vous sûr de vouloir supprimer l'utilisateur "{userToDelete?.name}" ?
              <br />
              Cette action est irréversible et supprimera toutes les données associées à cet utilisateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="text-sm">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white text-sm"
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