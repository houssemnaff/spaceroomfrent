// components/chat/ChatHeader.jsx
import React from 'react';
import { Menu, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ChatHeader = ({
  courseName,
  isConnected,
  isProfessorOrOwner,
  onReconnect,
  activeChat,
  toggleSidebar,
  userCache
}) => {
  const isPrivate = activeChat !== 'general';
  const chatPartner = isPrivate && userCache[activeChat] ? userCache[activeChat] : null;
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 flex items-center">
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden mr-2"
        onClick={toggleSidebar}
      >
        <Menu size={20} />
      </Button>
      
      {isPrivate ? (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
            {chatPartner?.imageurl ? (
              <img src={chatPartner.imageurl} alt={chatPartner.name} className="w-full h-full rounded-full" />
            ) : (
              chatPartner?.name?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <div>
            <h2 className="font-semibold">
              {chatPartner?.name || 'Loading...'}
              {chatPartner?.role === 'professor' && (
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(Professor)</span>
              )}
            </h2>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {courseName} • {chatPartner?.status === 'online' ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <Users size={20} className="mr-2" />
          <h2 className="font-semibold">Course Discussion</h2>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {courseName}
          </span>
        </div>
      )}
      
      {!isConnected && (
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={onReconnect}
          className="ml-auto"
        >
          Reconnect
        </Button>
      )}
    </div>
  );
};