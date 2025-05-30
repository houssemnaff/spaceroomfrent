// ActionListPopup.jsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FaPlus, FaUsers, FaClipboardList, FaGraduationCap } from "react-icons/fa";
import { Button } from "@/components/ui/button";

// Composant pour afficher chaque action sous forme de carte
const ActionCard = ({ title, description, icon, onClick }) => (
  <div
    className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 cursor-pointer transition"
    onClick={onClick}
  >
    <img src={icon} alt={title} className="w-10 h-10 rounded-md" />
    <div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

// Liste des actions
const actions = [
 /* {
    title: "Create Group",
    description: "Create and manage your study groups",
    icon: "https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/117a32068f874ff8f9ddb64507479ad0f117b180afabfc854da4df0fe07e5a4e?placeholderIfAbsent=true",
  },*/
 
 
  {
    title: "Create Course",
    description: "Design and publish new courses",
    icon: "https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/c6e2aab88b2963214a52d03ff53c9117c98d99c9d801f89f17f8a7c19109ef21?placeholderIfAbsent=true",
  },
  /*
  {
    title: "Create Quiz",
    description: "Build interactive quizzes and tests",
    icon: "https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/44ff9e07d223429133415052be893a632a866287aac678dce7e50c7b1481ffb9?placeholderIfAbsent=true",
  },*/
];

// ActionListPopup component
const ActionListPopup = ({ isOpen, onOpenChange, onActionClick }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="p-6 max-w-md">
      <DialogHeader>
        <DialogTitle>Ajouter un élément</DialogTitle>
      </DialogHeader>
      <div className="w-full mt-4 space-y-3">
        {actions.map((action, index) => (
          <ActionCard
            key={index}
            title={action.title}
            description={action.description}
            icon={action.icon}
            onClick={() => onActionClick(action.title)} // handleActionClick from parent
          />
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

export default ActionListPopup;
