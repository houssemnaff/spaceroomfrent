import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/pages/auth/authContext";
import { toast } from "react-toastify";

const JoinCourse = () => {
  const { accessKey } = useParams();
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasJoined, setHasJoined] = useState(false);
  const effectRan = useRef(false);

  const key = accessKey || localStorage.getItem("pendingCourseJoin");

  const handleJoin = async () => {
    if (hasJoined || !token || !user || !key) return;

    setHasJoined(true);
    localStorage.removeItem("pendingCourseJoin");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/course/join/${key}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message || "Vous avez rejoint le cours avec succès !", {
        containerId: "devoirs-toast",
      });

      navigate("/home");
    } catch (error) {
      let errorMessage = "Une erreur est survenue.";
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data.message;
            break;
          case 401:
            localStorage.setItem("pendingCourseJoin", key);
            errorMessage = "Session expirée, veuillez vous reconnecter";
            navigate("/login", { state: { from: location.pathname } });
            return;
          case 404:
            errorMessage = "Cours introuvable ou clé invalide";
            break;
          default:
            errorMessage = error.response.data.message || "Erreur inattendue";
        }
      }

      toast.error(errorMessage, {
        containerId: "devoirs-toast",
      });

      navigate("/home");
    }
  };

  useEffect(() => {
    if (effectRan.current || loading) return; // Attend que le chargement soit terminé

    // Si pas de token mais on a une clé d'accès, rediriger vers login
    if (!token && accessKey) {
      localStorage.setItem("pendingCourseJoin", accessKey);
      navigate("/login", { state: { from: location.pathname } });
      effectRan.current = true;
      return;
    }

    // Si tout est prêt (token, user, clé) et pas encore joint
    if (token && user && key && !hasJoined) {
      handleJoin();
      effectRan.current = true;
    }

    // Cas où il n'y a pas de clé du tout
    if (!key) {
      navigate("/home");
      effectRan.current = true;
    }
  }, [loading, token, user, key, hasJoined, accessKey, navigate, location.pathname]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Traitement de votre invitation...</h2>
        <p>Veuillez patienter pendant que nous vous ajoutons au cours.</p>
      </div>
    </div>
  );
};

export default JoinCourse;