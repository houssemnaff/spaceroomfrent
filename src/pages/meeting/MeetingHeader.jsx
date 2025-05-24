import { Button } from "@/components/ui/button";
import { Calendar, Video } from "lucide-react";

export const MeetingHeader = ({ courseName, isOwner, onOpenCreate, onOpenInstant }) => (
  <div className="flex flex-col space-y-4 mb-6 md:mb-8">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">Réunions</h2>
        <p className="text-sm md:text-base text-gray-500 mt-1">Gérez les réunions  pour {courseName}</p>
      </div>
      
      {isOwner && (
        <div className="flex flex-col md:flex-row gap-2 w-full sm:w-auto mt-1 sm:mt-0">
        <Button
            onClick={onOpenInstant}
            className="flex items-center justify-center gap-2 rounded-full"
            variant="secondary"
            size="sm"
            md="lg"
          >
            <Video className="h-4 w-4" />
            <span className="text-sm md:text-base">Réunion instantanée</span>
          </Button>
          
          <Button
            onClick={onOpenCreate}
            className="gap-2 rounded-full px-5 py-2 transition-all shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700"
            size="sm"
            md="lg"
          >
            <Calendar className="h-4 w-4" />
            <span className="text-sm md:text-base">Planifier une réunion</span>
          </Button>
        </div>
      )}
    </div>
  </div>
);