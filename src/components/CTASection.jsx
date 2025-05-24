import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useAuth } from "@/pages/auth/authContext";

export const CTASection = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth0/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      login(response.data.user, response.data.token);
      toast.success("Inscription réussie !");
      
      const pendingKey = localStorage.getItem("pendingCourseJoin");
      if (pendingKey) {
        localStorage.removeItem("pendingCourseJoin");
        navigate(`/course/join/${pendingKey}`);
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
      toast.error("Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="relative w-full px-6 py-20 sm:px-10 md:px-20 overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Moving geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-cyan-400/30 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-indigo-400/25 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-purple-400/20 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        
        {/* Animated lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse"></div>
          <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-blue-300/40 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
        </div>
        <div className="absolute top-1/4 left-3/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-1 bg-cyan-300/50 rounded-full animate-ping" style={{animationDelay: '1.2s'}}></div>
        </div>
        <div className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-indigo-300/30 rounded-full animate-ping" style={{animationDelay: '2.5s'}}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 mb-8 text-sm font-medium text-blue-100 bg-blue-800/30 backdrop-blur-sm rounded-full border border-blue-400/20">
          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
          Plus de 10 000 utilisateurs nous font confiance
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Rejoignez la{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent animate-pulse">
            révolution
          </span>{" "}
          éducative
        </h2>
        
        <p className="mt-6 text-xl text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
          Inscrivez-vous maintenant pour profiter de tous nos outils pédagogiques innovants 
          et rejoindre une communauté d'apprenants passionnés.
        </p>

        {/* Registration Form */}
        <div className="mt-12 relative group max-w-lg mx-auto">
          {/* Glowing border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 rounded-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>
          
          {/* Form container */}
          <div className="relative bg-gradient-to-br from-blue-800/50 to-indigo-900/50 backdrop-blur-xl rounded-2xl p-8 border border-blue-400/20">
            {error && (
              <div className="mb-6 p-4 text-sm text-red-100 bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-400/30">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="name" className="text-sm font-medium text-blue-100">
                    Nom complet
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Votre nom complet"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-12 rounded-xl bg-white/10 backdrop-blur-sm border-blue-400/30 text-white placeholder:text-blue-200/60 focus:border-cyan-400 focus:ring-cyan-400/20"
                    required
                  />
                </div>

                <div className="space-y-2 text-left">
                  <Label htmlFor="email" className="text-sm font-medium text-blue-100">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-12 rounded-xl bg-white/10 backdrop-blur-sm border-blue-400/30 text-white placeholder:text-blue-200/60 focus:border-cyan-400 focus:ring-cyan-400/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="password" className="text-sm font-medium text-blue-100">
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Créez un mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-12 rounded-xl bg-white/10 backdrop-blur-sm border-blue-400/30 text-white placeholder:text-blue-200/60 focus:border-cyan-400 focus:ring-cyan-400/20"
                    required
                  />
                </div>

                <div className="space-y-2 text-left">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-blue-100">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="h-12 rounded-xl bg-white/10 backdrop-blur-sm border-blue-400/30 text-white placeholder:text-blue-200/60 focus:border-cyan-400 focus:ring-cyan-400/20"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Inscription en cours...
                  </div>
                ) : (
                  "Créer mon compte gratuitement"
                )}
              </Button>
            </form>

            

            <div className="mt-6 text-center">
              <p className="text-blue-200/80 text-sm">
                Vous avez déjà un compte ?{" "}
                <button
                  type="button"
                  className="font-medium text-cyan-400 hover:text-cyan-300 underline hover:no-underline transition-all duration-200"
                  onClick={() => navigate("/login")}
                >
                  Se connecter
                </button>
              </p>
            </div>
          </div>
        </div>

        
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg className="w-full h-20 text-blue-800/30" viewBox="0 0 1200 120" fill="currentColor">
          <path d="M0,60 C400,20 800,100 1200,60 L1200,120 L0,120 Z">
            <animate attributeName="d" 
              values="M0,60 C400,20 800,100 1200,60 L1200,120 L0,120 Z;
                      M0,80 C400,40 800,80 1200,40 L1200,120 L0,120 Z;
                      M0,60 C400,20 800,100 1200,60 L1200,120 L0,120 Z" 
              dur="6s" 
              repeatCount="indefinite"/>
          </path>
        </svg>
      </div>
    </section>
  );
};