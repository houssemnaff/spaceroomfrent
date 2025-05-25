import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Video, Users, Clock, MoreVertical } from "lucide-react";

const MeetingListItem = ({
  meeting,
  isLive,
  isSoonAvailable,
  isPast,
  onJoin,
  onEdit,
  onDelete,
  isOwner,
  
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
  
  const handleEdit = () => {
    setIsDropdownOpen(false);
    onEdit(meeting);
  };

  const handleDelete = () => {
    setIsDropdownOpen(false);
    onDelete(meeting);
  };
  const start=new Date(meeting.startTime) 
   return (
    <li className="p-4 border-b last:border-b-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="hidden sm:flex items-center justify-center h-10 w-10 bg-blue-50 rounded-full shrink-0">
            <Video className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium text-base sm:text-lg truncate max-w-full">{meeting.title}</h3>
              <div className="flex flex-wrap gap-1">
                {isLive && <Badge className="bg-red-500 text-xs whitespace-nowrap">En direct</Badge>}
                {isSoonAvailable && <Badge className="bg-green-500 text-xs whitespace-nowrap">Bientôt disponible</Badge>}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">
              {formatDateTime(meeting.startTime)} 
            </div>
            {meeting.description && (
              <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">{meeting.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center text-gray-500 text-xs">
                <Users className="h-3 w-3 mr-1" />
                {meeting.attendees?.length || 0} participants
              </div>
              <div className="flex items-center text-gray-500 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {meeting.duration} minutes
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center mt-3 lg:mt-0 justify-between sm:justify-start gap-2">
          <div className="flex-1 sm:flex-none">
            {!isPast && (
              <Button
                size="sm"
                onClick={() => onJoin(meeting)}
                disabled={!isLive && !isSoonAvailable && !meeting.isInstant}
                className={`w-full sm:w-auto text-xs sm:text-sm ${
                  isLive || meeting.isInstant ? "bg-red-500 hover:bg-red-600" : ""
                }`}
              >
                <Video className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                {isLive || meeting.isInstant ? "Rejoindre" : "Accéder"}
              </Button>
            )}
          </div>
          {isOwner && (
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </li>
  );
};

export default MeetingListItem;