import React from "react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import UserAvatarGroup from "../ui/UserAvatarGroup";
import { Link, useNavigate } from "react-router-dom";

const QuizCard = ({
  id,
  icon,
  title,
  description,
  status,
  openingDate,
  closingDate,
  timeLimit,
  members = 0,
  avatars = []
}) => {
  // Function to determine the color of the badge based on status
  const getStatusStyle = (status) => {
    switch (status) {
      case "actif":
        return "bg-green-200 text-green-800";
      case "à venir":
        return "bg-blue-200 text-blue-800";
      case "terminé":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-yellow-200 text-yellow-800";
    }
  };
  const navigate = useNavigate(); // ✅ Importer et initialiser useNavigate
  const handleCardClick = () => {
    navigate(`/home/quiz/${id}`);
  };
  return (

      <Card className="w-full hover:shadow-lg transition-shadow duration-300 h-full cursor-pointer"
       onClick={handleCardClick}
      >
        
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={icon} alt={title} />
                <AvatarFallback>QZ</AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg font-medium">{title}</CardTitle>
            </div>
            <Badge variant="secondary" className={getStatusStyle(status)}>
              {status}
            </Badge>
          </div>
          <CardDescription className="text-sm mt-2 line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-xs text-gray-500 mt-2">
            <div className="flex justify-between mb-1">
              <span>Ouverture:</span>
              <span className="font-medium">{openingDate}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Fermeture:</span>
              <span className="font-medium">{closingDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Durée:</span>
              <span className="font-medium">{timeLimit}</span>
            </div>
          </div>
        </CardContent>

        {avatars && avatars.length > 0 && (
          <CardFooter className="pt-2">
            <div className="flex items-center">
              <UserAvatarGroup users={avatars} maxCount={3} />
              {members > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  {members} {members === 1 ? 'cours associé' : 'cours associés'}
                </span>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
  
  );
};

export default QuizCard;