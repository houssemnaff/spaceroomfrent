import React, { useEffect } from 'react';
import { Check, CheckCheck } from "lucide-react";

export const ChatMessages = ({
  messages,
  currentUserId,
  userCache,
  isPrivateChat = false,
  messageEndRef
}) => {
  // Scroll to bottom when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messageEndRef]);

  const getUserInitial = (userId) => {
    const userData = userCache[userId];
    return userData?.name ? userData.name.charAt(0).toUpperCase() : "?";
  };

  const getUserName = (userId) => {
    return userCache[userId]?.name || "User";
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true
    });
  };

  // Advanced deduplication logic
  const deduplicatedMessages = messages.reduce((acc, current) => {
    // Case 1: Message has _id (confirmed message)
    if (current._id) {
      // Remove any existing message with same _id
      acc = acc.filter(msg => msg._id !== current._id);
      // Remove any temporary version with same tempId
      if (current.tempId) {
        acc = acc.filter(msg => msg.tempId !== current.tempId);
      }
      acc.push(current);
    } 
    // Case 2: Temporary message (no _id)
    else if (current.tempId) {
      // Only add if no existing message with same tempId
      // and no confirmed message will replace it
      const exists = acc.some(msg => 
        msg.tempId === current.tempId || 
        (msg._id && msg.tempId === current.tempId)
      );
      if (!exists) {
        acc.push(current);
      }
    }
    // Case 3: Message with no id at all (shouldn't happen)
    else {
      acc.push(current);
    }
    return acc;
  }, []);

  return (
    <div className="flex-1 overflow-y-auto py-2 space-y-3">
      {deduplicatedMessages.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
          No messages yet. Start the conversation!
        </div>
      )}

      {deduplicatedMessages.map((msg, index) => {
        const isOwnMessage = msg.sender === currentUserId;
        const prevMsg = index > 0 ? deduplicatedMessages[index - 1] : null;
        const showUserInfo = !prevMsg || prevMsg.sender !== msg.sender;
        
        return (
          <div key={msg._id || msg.tempId || `msg-${index}`}>
            {showUserInfo && !isOwnMessage && (
              <div className="ml-10 text-xs text-gray-500 dark:text-gray-400 mb-1">
                {getUserName(msg.sender)}
                {userCache[msg.sender]?.role === "professor" && (
                  <span className="ml-1 px-1 py-0.5 text-xs rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    Professor
                  </span>
                )}
              </div>
            )}
            
            <div className={`flex items-end gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
              {!isOwnMessage && (
                userCache[msg.sender]?.imageurl ? (
                  <img 
                    src={userCache[msg.sender].imageurl} 
                    alt="user" 
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0 object-cover" 
                  />
                ) : (
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-500 flex items-center justify-center text-white flex-shrink-0">
                    {getUserInitial(msg.sender)}
                  </div>
                )
              )}
              
              <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                <div 
                  className={`p-2 md:p-3 rounded-lg max-w-xs md:max-w-md break-words ${
                    isOwnMessage 
                      ? "bg-blue-500 text-white"
                      : userCache[msg.sender]?.role === "professor" 
                        ? "bg-purple-100 dark:bg-purple-900" 
                        : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {msg.text}
                </div>
                
                <div className="flex items-center mt-1 space-x-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                  {isOwnMessage && isPrivateChat && (
                    msg.read ? (
                      <CheckCheck className="w-3 h-3 text-blue-500" />
                    ) : (
                      <Check className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                    )
                  )}
                </div>
              </div>
              
              {isOwnMessage && (
                userCache[currentUserId]?.imageurl ? (
                  <img 
                    src={userCache[currentUserId].imageurl} 
                    alt="user" 
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0 object-cover" 
                  />
                ) : (
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-500 flex items-center justify-center text-white flex-shrink-0">
                    {getUserInitial(currentUserId)}
                  </div>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};