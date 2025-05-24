import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Acceuil from "./pages/comun/acceuil";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import { DashboardLayout } from "./pages/comun/DashboardLayout";
import DevoirsPage from "./pages/prof/DevoirsPage";
import NotesPage from "./pages/prof/NotesPage";
import DiscussionPage from "./pages/prof/DiscussionPage";
import CoursePage from "./pages/prof/CoursePage";
import { ChaptersList } from "./components/layouts/courbord/ChaptersList";
import { MainContent } from "./pages/comun/MainContent";
import AgendaPage from "./pages/comun/agenda";
import CreatedCourses from "./pages/comun/CreatedCourses";
import JoinedCourses from "./pages/comun/JoinedCourses";
import { AuthProvider } from "./pages/auth/authContext";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import Studentpage from "./pages/prof/studentPage";
import JoinCourse from "./pages/prof/courjoin";
import AssignmentDetail from "./pages/prof/assignmentdetail";
import Meetingpage from "./pages/prof/NotesPage";
import ArchivesPage from "./pages/comun/courarchieves";
import SettingsPage from "./pages/comun/parameters";

import { NotificationProvider } from "./pages/context/notificationcontext";
import AdminProtectedRoute from "./pages/auth/adminprotectrouter";
import UsersPage from "./pages/admin/UsersPage";
import AdminLayout from "./pages/admin/adminindex";
import NotesQuiz from "./pages/prof/notequiz";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import { ThemeProvider } from "./pages/admin/componnents/themcontext";
import { SidebarProvider } from "./pages/admin/componnents/sidebarcontext";
import Utilisateurs from "./pages/admin/UsersPage";
import Dashboard from "./pages/admin";
import CoursesPage from "./pages/admin/CoursesPage";
import MeetingPage from "./pages/admin/meetingpage";
import RessourcePage from "./pages/admin/ressourcepages";
import QuizPage from "@/pages/quiz/QuizPage";
import ContactPage from "./pages/comun/supportpage";
import DevoirPage from "./pages/admin/support";
import { ToastContainer } from "react-toastify";
import ForgotPassword from "./pages/comun/passwordoublier";
import ResetPassword from "./pages/comun/resetpassword";
import Support from "./pages/comun/support";

const App = () => {
  return (
    <Router>
      <ThemeProvider> 
      <AuthProvider>
        <NotificationProvider>
        <SidebarProvider> 
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Acceuil />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Route spécifique pour rejoindre un cours - en dehors des routes protégées */}
            <Route path="/course/join/:accessKey" element={<JoinCourse />} />

            {/* Routes protégées sous /home */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<DashboardLayout />}>
                <Route index element={<MainContent />} />
                <Route path="agenda" element={<AgendaPage />} />
                <Route path="coursinscrit" element={<CreatedCourses />} />
                <Route path="courjoin" element={<JoinedCourses />} />
                <Route path="archives" element={<ArchivesPage/>} />
                <Route path="profile" element={<SettingsPage/>} />
                <Route path="support" element={<Support/>} />


             

                {/* Sous-routes pour CoursePage */}
                <Route path="course/:id" element={<CoursePage />}>
                  <Route index element={<ChaptersList />} />
                  <Route path="cours" element={<ChaptersList />} />
                  <Route path="note" element={<NotesQuiz />} />
                  <Route path="student" element={<Studentpage />} />
                  <Route path="devoirs" element={<DevoirsPage />} />
                  <Route path="assignments/:assignmentId" element={<AssignmentDetail />} />
                  <Route path="meeting" element={<Meetingpage />} />
                  <Route path="discussion" element={<DiscussionPage />} />
                  <Route path="chapter/:chapterId/quiz/:quizId" element={<QuizPage />} />
                </Route>


               



              </Route>


                {/* Routes admin protégées sous /admin */}
               
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout/>}>
                <Route index element={<Dashboard />} />
                <Route path="analytec" element={<AnalyticsPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="meeting" element={<MeetingPage />} />
                <Route path="ressource" element={<RessourcePage />} />
                <Route path="assignments" element={<DevoirPage />} />
               
              </Route>
            </Route>
           
            </Route>
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
          </SidebarProvider>
        </NotificationProvider>
      </AuthProvider>
      </ThemeProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        
        limit={3}
        style={{ zIndex: 9999 }}
        enableMultiContainer
        containerId="devoirs-toast"
      />
    </Router>
    
  );
};

export default App;