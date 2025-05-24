import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import axios from "axios";
import { useAuth } from "@/pages/auth/authContext";
import { toast } from "react-toastify";

const Joinform = ({ isOpen, onOpenChange, onSubmit, onCancel }) => {
  const { user, token } = useAuth();
  const [mode, setMode] = useState("key"); // "key" for access key, "link" for link
  const { register, handleSubmit, formState: { errors } } = useForm();
  const handleFormSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/course/join`,
        {
          accessKey: data.key || data.keylien, // Submit the key or link
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Assuming you're using token-based auth
          },
        }
      );
  
      // Handle success response from backend
      if (response.status === 200) {
       // toast.success(response.data.message || "Vous avez rejoint le cours avec succès! ✅");
        onSubmit(); // Close the dialog and handle success
      }
    } catch (error) {
      console.error("Error joining course:", error);
  
      // Handle specific error messages from the backend
      if (error.response) {
        // Backend returned an error response (e.g., 400, 404, 500)
        const errorMessage = error.response.data.message;
  
        // Display specific error messages
        if (errorMessage === "Vous avez déjà rejoint ce cours") {
          toast.info("Vous avez déjà rejoint ce cours", {
            containerId: "devoirs-toast"
      
          });
        } else if (errorMessage === "Vous ne pouvez pas rejoindre votre propre cours") {
          toast.info("Vous ne pouvez pas rejoindre votre propre cours", {
            containerId: "devoirs-toast"
      
          });
        } else if (errorMessage === "Clé d'accès incorrecte ou cours introuvable") {
          toast.error("Clé d'accès incorrecte ou cours introuvable", {
            containerId: "devoirs-toast"
      
          });
        } else {
          // Default error message
          toast.error("Une erreur est survenue, veuillez réessayer.", {
            containerId: "devoirs-toast"
      
          });
        }
      } else if (error.request) {
        // No response received from the backend (e.g., network error)
        toast.error("Pas de réponse du serveur. Vérifiez votre connexion internet.", {
          containerId: "devoirs-toast"
    
        });
      } else {
        // Other errors (e.g., Axios configuration error)
        toast.error("Une erreur est survenue, veuillez réessayer.", {
          containerId: "devoirs-toast"
    
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full p-6 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center text-xl font-semibold text-gray-800 pb-3 border-b">
          <div>Rejoindre</div>
        </div>

        {/* Mode Selection 
        <div className="flex justify-center gap-4 mt-4">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-sm ${mode === "key" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setMode("key")}
          >
            Accès par Clé
          </button>
         
        </div>*/}

        {/* Form based on mode */}
        {mode === "key" ? (
          <div className="mt-6">
            <label className="block text-gray-700 text-sm font-medium mb-1">Clé d'accès</label>
            <Input
              {...register("key", { required: "La clé d'accès est requise" })}
              className="w-full"
            />
            {errors.key && <span className="text-red-500 text-sm">{errors.key.message}</span>}
          </div>
        ) : (
          <div className="mt-6">
            <label className="block text-gray-700 text-sm font-medium mb-1">Lien d'invitation</label>
            <Input
              {...register("keylien", { required: "Le lien est requis" })}
              className="w-full"
            />
            {errors.keylien && <span className="text-red-500 text-sm">{errors.keylien.message}</span>}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" onClick={onCancel} variant="outline" className="text-gray-700 px-4 py-2 rounded-lg">
            Annuler
          </Button>
          <Button 
            type="button" 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            onClick={handleSubmit(handleFormSubmit)}
          >
            Confirmer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Joinform;
