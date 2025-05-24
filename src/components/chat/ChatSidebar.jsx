import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GraduationCap, MessageCircle, Users, X } from "lucide-react";

export const ChatSidebar = ({
  courseName,
  isOpen,
  isProfessorOrOwner,
  isConnected,
  onReconnect,
  courseUsers,
  courseProfessor, // Nouvelle prop
  activeChat,
  onSelectChat,
  currentUserId,
  unreadMessages
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Combiner le professeur et les étudiants
  const allUsers = courseProfessor
    ? [courseProfessor, ...courseUsers.filter(u => u._id !== courseProfessor._id)]
    : [...courseUsers];
  const filteredUsers = allUsers.filter(user =>
    user._id !== currentUserId &&
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div
      className={`w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } absolute md:relative z-10`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
          {courseName} - Chat
        </h2>
      </div>

      {isProfessorOrOwner && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 text-xs text-blue-700 dark:text-blue-300">
          You are viewing as instructor
        </div>
      )}

      {!isConnected && (
        <div className="bg-red-50 dark:bg-red-900/20 p-2 text-xs text-red-700 dark:text-red-300 flex justify-between items-center">
          Disconnected from server
          <Button size="sm" variant="outline" onClick={onReconnect}>
            Reconnect
          </Button>
        </div>
      )}

      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-y-auto flex-1">
        <div className="p-2">
          <button
            className={`w-full flex items-center p-2 rounded-md ${activeChat === 'general'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            onClick={() => onSelectChat('general')}
          >
            <Users size={18} className="mr-2" />
            <span>Course Discussion</span>
            {unreadMessages?.general > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadMessages.general}
              </span>
            )}
          </button>
        </div>

        <div className="p-2">
          <h3 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
            Private Messages
          </h3>

          {filteredUsers?.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
              {searchTerm ? "No users found" : "No other users in this course"}
            </p>
          ) : (
            filteredUsers?.map(user => (
              <button
                key={user._id}
                className={`w-full flex items-center p-2 rounded-md ${activeChat === user._id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                onClick={() => onSelectChat(user._id)}
              >
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs mr-2 overflow-hidden">
                  {user.imageurl ? (
                    <img src={user.imageurl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="truncate">
                  {user.name}
                  {user._id === courseProfessor._id && (

                    <span className="ml-1 text-xs italic text-gray-500 dark:text-gray-400">

                      (Professor)
                    </span>
                  )}
                </span>
                {unreadMessages[user._id] > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadMessages[user._id]}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};