// CoursePreview.jsx
import React from "react";
import { ImageIcon, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; // Supposant que vous avez un composant Avatar de shadcn
import { cn } from "@/lib/utils"; // Utilitaire de shadcn
import { useAuth } from "@/pages/auth/authContext";

const CoursePreview = ({
  title = "Titre du cours",
  subject = "Matière",
  imageUrl,
  description = "",
  ownerName = "John Doe",
  ownerAvatarUrl = "",
}) => {


  const {user}=useAuth();
  return (
    <div className="w-full">
      <h2 className="text-gray-700 text-lg font-medium mb-4">Aperçu du cours</h2>

      <Card className="overflow-hidden border-gray-200 shadow-sm relative">
        {/* Section de l'image comme arrière-plan */}
        <div className="relative w-full aspect-video bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-end w-full h-full">
              <ImageIcon className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Overlay sombre pour améliorer la lisibilité du texte */}
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Contenu superposé sur l'image */}
          <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
            {/* En-tête avec le titre, la matière et l'avatar */}
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-600 hover:bg-blue-100">
                  {subject}
                </Badge>
               
              </div>
              {/* Avatar de l'owner */}
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={user.imageurl} alt={user.name} />
                <AvatarFallback>
                  <User className="w-5 h-5 text-gray-500" />
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Description du cours */}
            {description && (
              <p className="text-sm line-clamp-2">{description}</p>
            )}

          </div>
        </div>
      </Card>
    </div>
  );
};

export default CoursePreview;