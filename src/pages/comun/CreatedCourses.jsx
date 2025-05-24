import React, { useState, useEffect } from "react";

import { useAuth } from "@/pages/auth/authContext";
import axios from "axios";
import Navbartablebord from "@/components/layouts/board/navbartablebord";
import { CourseCard } from "@/components/cards/CourseCard";

 const CreatedCourses = () => {
  const { user, token } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [joinedCourses, setJoinedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
      //  console.log(token);
        const headers = { Authorization: `Bearer ${token}` };

        // Récupérer les cours créés par l'utilisateur
        const myCoursesRes = await axios.get(`${import.meta.env.VITE_API_URL}/course/my-courses`, { headers });
       // console.log("Mes cours créés", myCoursesRes.data);
        setMyCourses(myCoursesRes.data.courses || []);

      } catch (error) {
        console.error("Erreur lors de la récupération des cours :", error);
        setError("Erreur lors de la récupération des cours");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchCourses();
  }, [user]);

  if (loading) {
    return <div>Chargement en cours...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  // Fusionner les cours créés et joints
  const allCourses = [...myCourses];

  // Handler when a course is deleted
  const handleCourseDeleted = (courseId) => {
    setMyCourses(currentCourses => currentCourses.filter(course => course._id !== courseId));
  };

  // Handler when a user leaves a course
  const handleCourseLeft = (courseId) => {
    setJoinedCourses(currentCourses => currentCourses.filter(course => course._id !== courseId));
  };

  return (
    <main className="bg-[rgba(0,0,0,0)] flex w-full flex-col items-stretch mx-auto pt-8 pb-[520px] px-8 max-md:max-w-full max-md:pb-[100px] max-md:px-5">
     

      {/* Section Mes Cours */}
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
                        avatar={course.owner.imageurl}
                        description={course.description}
                        isOwner={course.owner._id === user._id} // Vérifier si l'utilisateur est le propriétaire
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
export default CreatedCourses;


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