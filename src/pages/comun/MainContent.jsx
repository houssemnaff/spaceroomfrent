import React, { useState, useEffect } from "react";
import { CourseCard } from "../../components/cards/CourseCard";
import Navbartablebord from "../../components/layouts/board/navbartablebord";
import { useAuth } from "@/pages/auth/authContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { fetchJoinedCourses, fetchMyCourses } from "@/services/coursapi";
;
import { toast } from "react-toastify";
export const MainContent = () => {
  const { user, token } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [joinedCourses, setJoinedCourses] = useState([]);
  const [joinedquiz, setJoinedquiz] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour rafraîchir les cours
  const refreshCourses = async () => {
    try {
      setLoading(true);
      const [myCoursesData, joinedCoursesData] = await Promise.all([
        fetchMyCourses(token),
        fetchJoinedCourses(token),
      ]);
      setMyCourses(myCoursesData);
      setJoinedCourses(joinedCoursesData);
    } catch (error) {
     // console.error("Erreur lors de la récupération des cours :", error);
      setError(error.message || "Une erreur est survenue");
      toast.error("Erreur lors du chargement des cours", {
        containerId: "devoirs-toast"

      });
    } finally {
      setLoading(false);
    }
  };


  // Charger les cours et les quiz au montage du composant
  useEffect(() => {
    if (user) {
      refreshCourses();
     
    }
  }, [user, token]);

  // Handler when a course is deleted
  const handleCourseDeleted = (courseId) => {
    setMyCourses(currentCourses => currentCourses.filter(course => course._id !== courseId));
  };

  // Handler when a user leaves a course
  const handleCourseLeft = (courseId) => {
    setJoinedCourses(currentCourses => currentCourses.filter(course => course._id !== courseId));
  };

  const allCourses = [...myCourses, ...joinedCourses];
  //console.log("course",allCourses);

  const allquiz = [...myQuizzes, ...joinedquiz];

  // Format date pour affichage
  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  return (
    <main className="flex flex-col items-stretch w-full mx-auto p-4 md:p-6 lg:p-8 bg-transparent">
      {/* Navbar avec un espacement réduit */}
      <div className="pb-4">
        <Navbartablebord refreshCourses={refreshCourses}  />
      </div>

      {/* Section Mes Cours */}
      <section className="mt-6">
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              [...Array(3)].map((_, index) => (
                <Skeleton key={index} height={100} className="rounded-lg" />
              ))
            ) : allCourses.length > 0 ? (
              allCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  id={course._id}
                  icon={course.imageurl}
                  title={course.title}
                  professor={course.owner.name}
                  ownerid={course.owner._id}
                  students={course.students.length}
                  description={course.description}
                  avatar={course.owner.imageurl}
                  isOwner={course.owner._id === user._id}
                  onCourseDeleted={handleCourseDeleted}
                  onCourseLeft={handleCourseLeft}
                />
              ))
            ) : (
              <EmptyCoursesMessage/>
            )}
          </div>
        </div>


      </section>
    </main>
  );
};
const EmptyCoursesMessage = () => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
      {/* SVG Animé avec personnage et bulle de dialogue */}
      <svg 
        width="200" 
        height="200" 
        viewBox="0 0 200 200" 
        className="mb-6"
      >
        {/* Fond circulaire animé */}
        <circle 
          cx="100" 
          cy="100" 
          r="80" 
          fill="#EFF6FF" 
          className="animate-pulse-slow dark:fill-gray-700"
        />
        
        {/* Personnage */}
        <g className="animate-bounce-soft">
          {/* Tête */}
          <circle cx="100" cy="80" r="25" fill="#8BB8E8" stroke="#4C51BF" strokeWidth="2" className="dark:fill-blue-400 dark:stroke-blue-300"/>
          
          {/* Yeux */}
          <circle cx="90" cy="75" r="4" fill="#2D3748" className="animate-blink dark:fill-gray-200"/>
          <circle cx="110" cy="75" r="4" fill="#2D3748" className="animate-blink dark:fill-gray-200"/>
          
          {/* Sourire */}
          <path 
            d="M85 95 Q100 110 115 95" 
            stroke="#2D3748" 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
            className="dark:stroke-gray-200"
          />
          
          {/* Corps */}
          <rect x="85" y="110" width="30" height="40" rx="5" fill="#6E56CF" stroke="#4C51BF" strokeWidth="2" className="dark:fill-purple-500 dark:stroke-purple-400"/>
          
          {/* Livre (animé séparément) */}
          <g className="animate-book-float">
            <rect x="120" y="115" width="30" height="25" rx="3" fill="#FFD166" stroke="#D97706" strokeWidth="1.5" className="dark:fill-yellow-300 dark:stroke-yellow-500"/>
            <line x1="120" y1="125" x2="150" y2="125" stroke="#92400E" strokeWidth="1" className="dark:stroke-yellow-600"/>
            <line x1="120" y1="130" x2="150" y2="130" stroke="#92400E" strokeWidth="1" className="dark:stroke-yellow-600"/>
          </g>
        </g>
        
        {/* Bulle de dialogue animée */}
        <g className="animate-float">
          <path 
            d="M50 60 C40 30 20 40 30 70 C25 75 45 75 50 70 Z" 
            fill="white" 
            stroke="#CBD5E0" 
            strokeWidth="1.5"
            className="dark:fill-gray-700 dark:stroke-gray-500"
          />
          <text 
            x="40" 
            y="60" 
            fontSize="12" 
            fontWeight="bold" 
            fill="#4C51BF"
            textAnchor="middle"
            className="dark:fill-blue-300"
          >
            ?
          </text>
        </g>
      </svg>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Aucun cours disponible
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
        Vous n'avez rejoint aucun cours pour le moment. Commencez votre parcours d'apprentissage !
      </p>
     
      {/* Styles d'animation intégrés */}
      <style jsx>{`
        .animate-pulse-slow {
          animation: pulse 4s ease-in-out infinite;
        }
        .animate-bounce-soft {
          animation: bounce 6s ease-in-out infinite;
        }
        .animate-book-float {
          animation: bookFloat 3s ease-in-out infinite;
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-blink {
          animation: blink 4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bookFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-5px) translateX(2px); }
          75% { transform: translateY(3px) translateX(-2px); }
        }
        @keyframes blink {
          0%, 45%, 55%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
        }
      `}</style>
    </div>
  );
};