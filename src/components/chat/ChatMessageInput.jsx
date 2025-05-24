import React from 'react';
import { Send } from "lucide-react";

export const ChatMessageInput = ({
  message,
  onChange,
  onSend,
  isConnected,
  placeholder = "Type a message..."
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <textarea
        value={message}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={!isConnected}
        placeholder={isConnected ? placeholder : "Reconnecting..."}
        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
        rows="1"
        style={{ minHeight: '40px', maxHeight: '120px' }}
      />
      
      <button
        onClick={onSend}
        disabled={!isConnected || !message.trim()}
        className={`p-2 rounded-full h-10 w-10 flex items-center justify-center ${
          !isConnected || !message.trim() 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
};