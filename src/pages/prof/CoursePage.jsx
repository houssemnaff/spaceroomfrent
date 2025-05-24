import { Outlet, useNavigate, useParams } from "react-router-dom";
import { CourseHeader } from "@/components/layouts/courbord/CourseHeader";
import { CourseNavigation } from "@/components/layouts/courbord/CourseNavigation";
import { useAuth } from "../auth/authContext";
import { useState, useEffect } from "react";
import axios from "axios";
import NotFound from "../notfound";
import { useTheme } from "../admin/componnents/themcontext";

const CoursePage = () => {
  const { id, tab } = useParams();
  const [courseDetails, setCourseDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const activeTab = tab || "cours";
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/course/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(response => {
        if (response.data.course) {
          setCourseDetails(response.data.course);
          
          // Vérifier si l'utilisateur est le propriétaire ou un étudiant du cours
          const isOwner = response.data.course.owner._id === user?._id;
          const isStudent = response.data.course.students.some(student => student._id === user?._id);
          
          if (!isOwner && !isStudent) {
            navigate('/home');
          }
        } else {
          setCourseDetails(null);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching course details:", error);
        setCourseDetails(null);
        setIsLoading(false);
      });
  }, [user, id, navigate, token]);

  if (isLoading) {
    return <div className={`w-full min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div>Loading...</div>
    </div>;
  }

  if (courseDetails === null) {
    return <NotFound />;
  }

  const isOwner = courseDetails?.owner._id === user?._id;

  return (
    <div className={`w-full min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <main className="flex-1 overflow-y-auto">
        {courseDetails && <CourseHeader course={courseDetails} isDark={isDark} />}
        <CourseNavigation activeTab={activeTab} isDark={isDark} />
        <section className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
          <Outlet context={{ courseDetails, isOwner, isDark }} />
        </section>
      </main>
    </div>
  );
};

export default CoursePage;