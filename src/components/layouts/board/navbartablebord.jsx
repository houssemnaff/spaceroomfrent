import React, { useState } from "react";
import { FaPlus, FaUsers } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import CourseFormPopup from "../Popup/addcour/CourseFormPopup";
import Joinform from "../Popup/join/joinform";

const Navbartablebord = ({ refreshCourses }) => {
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  const handleCloseDialog = () => {
    setIsCourseDialogOpen(false);
    setIsJoinDialogOpen(false);
  };

  const handleSuccess = (message) => {
    toast.success(message, {
      containerId: "devoirs-toast"}
);
    handleCloseDialog();
    refreshCourses();
  };

  // Open forms directly when buttons are clicked
  const handleJoinClick = () => {
    setIsJoinDialogOpen(true);
  };

  const handleAddClick = () => {
    setIsCourseDialogOpen(true);
  };

  return (
    <>
      <nav className="w-full bg-transparent text-black py-4 px-8 max-md:px-5 flex justify-between items-center">
        <div className="flex items-center gap-4 text-base ml-auto">
          <Button
            className="bg-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={handleJoinClick}
          >
            <FaUsers className="text-xl" />
            <span>Join</span>
          </Button>

          <Button
            className="bg-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={handleAddClick}
          >
            <FaPlus className="text-xl" />
            <span>Ajouter</span>
          </Button>

          <CourseFormPopup
            isOpen={isCourseDialogOpen}
            onOpenChange={setIsCourseDialogOpen}
            onSubmit={() => handleSuccess("Course created successfully! ")}
            onCancel={handleCloseDialog}
          />

          <Joinform
            isOpen={isJoinDialogOpen}
            onOpenChange={setIsJoinDialogOpen}
            onSubmit={() => handleSuccess("Joined course successfully! ")}
            onCancel={handleCloseDialog}
          />
        </div>
      </nav>

     
    </>
  );
};

export default Navbartablebord;