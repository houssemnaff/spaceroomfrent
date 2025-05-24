import { useParams, useOutletContext } from "react-router-dom";
import { useAuth } from "@/pages/auth/authContext";
import {TeacherAssignmentView} from "./teacherAssignmentView";
import { StudentAssignmentView } from "../etudiant/studentAssignmentView";


const AssignmentDetail = () => {
  const { courseDetails, isOwner } = useOutletContext();
  const { user } = useAuth();
  
  // Determine if the current user is a teacher (owner of the course)
  const isTeacher = isOwner;

  return (
    <>
      {isTeacher ? (
        <TeacherAssignmentView />
      ) : (
        <StudentAssignmentView />
      )}
    </>
  );
};

export default AssignmentDetail;