import React, { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import { Menu, X, Send } from "lucide-react";

// Import custom hooks and contexts
import { useAuth } from "../auth/authContext";
import { useOutletContext } from "react-router-dom";
import { fetchUserById } from "@/services/userapi";
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatMessageInput } from '@/components/chat/ChatMessageInput';
import { fetchCourseStudents } from '@/services/coursapi';

 const ChatApp = () => {
  const [message, setMessage] = useState("");
  const [courseMessages, setCourseMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});
  const [userCache, setUserCache] = useState({});
  const [courseUsers, setCourseUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeChat, setActiveChat] = useState('general'); // 'general' or userId
  const [unreadMessages, setUnreadMessages] = useState({});

  const { user, token } = useAuth();
  const { courseDetails, isOwner } = useOutletContext();
  const courseId = courseDetails._id;
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socket = useRef(null);

  // Socket initialization and connection logic
  useEffect(() => {
    socket.current = io(`${import.meta.env.VITE_API_URL}`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: `Bearer ${token}`
      }
    });

    const onConnect = () => {
     // console.log("Connected to socket server");
      setIsConnected(true);
      socket.current.emit("join_course", courseId);
      
      // If there's an active private chat, join it immediately after connection
      if (activeChat !== 'general') {
        socket.current.emit("join_private_chat", { 
          receiverId: activeChat, 
          courseId: courseId 
        });
      }
    };

    const onDisconnect = () => {
     // console.log("Disconnected from socket server");
      setIsConnected(false);
    };

    const onReconnectError = (error) => {
      console.error("Reconnect error:", error);
    };

    socket.current.on("connect", onConnect);
    socket.current.on("disconnect", onDisconnect);
    socket.current.on("reconnect_error", onReconnectError);

    return () => {
      socket.current.off("connect", onConnect);
      socket.current.off("disconnect", onDisconnect);
      socket.current.off("reconnect_error", onReconnectError);
      socket.current.disconnect();
    };
  }, [courseId, token, activeChat]);

  // Socket event handlers
  useEffect(() => {
    if (!socket.current) return;

    // Existing course messages
    socket.current.on("existing_messages", (data) => {
     // console.log("Received existing course messages:", data);
      setCourseMessages(data);
    });

    // Receive course message
    socket.current.on("receive_message", (data) => {
     // console.log("Received new course message:", data);
      setCourseMessages((prevMessages) => {
        const exists = prevMessages.some(msg => msg._id === data._id);
        if (exists) return prevMessages;
        
        const pendingIndex = pendingMessages.findIndex(
          pending => pending.text === data.text && pending.sender === data.sender
        );
        
        if (pendingIndex !== -1) {
          setPendingMessages(prev => prev.filter((_, i) => i !== pendingIndex));
          
          return prevMessages.map(msg => 
            (msg.tempId && msg.text === data.text && msg.sender === data.sender) 
              ? data 
              : msg
          );
        }
        
        // Increment unread message count if not the active chat
        if (activeChat !== 'general' && data.sender !== user._id) {
          setUnreadMessages(prev => ({
            ...prev,
            general: (prev.general || 0) + 1
          }));
        }
        
        return [...prevMessages, data];
      });
    });

    // Existing private messages
    socket.current.on("private_existing_messages", (data) => {
    //  console.log("Received existing private messages:", data);
      if (data.length > 0) {
        const partnerId = data[0].sender === user._id ? data[0].receiver : data[0].sender;
        setPrivateMessages(prev => ({
          ...prev,
          [partnerId]: data
        }));
      }
    });

    // Receive private message
    socket.current.on("receive_private_message", (data) => {
     // console.log("Received new private message:", data);
      // Only process if the message is for the current course
      if (data.courseId !== courseId) return;
      
      const chatPartnerId = data.sender === user._id ? data.receiver : data.sender;
      
      setPrivateMessages(prev => {
        const existingMessages = prev[chatPartnerId] || [];
        
        // Check for duplicates using both _id and tempId
        const isDuplicate = existingMessages.some(msg => 
          (msg._id && msg._id === data._id) || 
          (msg.tempId && msg.text === data.text && msg.sender === data.sender)
        );
        
        if (isDuplicate) {
          // Replace temporary message with confirmed message
          return {
            ...prev,
            [chatPartnerId]: existingMessages.map(msg => 
              (msg.tempId && msg.text === data.text && msg.sender === data.sender)
                ? data
                : msg
            )
          };
        }
        
        // Increment unread message count if not the active chat
        if (activeChat !== chatPartnerId && data.sender !== user._id) {
          setUnreadMessages(prevCounts => ({
            ...prevCounts,
            [chatPartnerId]: (prevCounts[chatPartnerId] || 0) + 1
          }));
        }
        
        return {
          ...prev,
          [chatPartnerId]: [...existingMessages, data]
        };
      });

      // Remove from pending messages if it was there
      setPendingMessages(prev => 
        prev.filter(msg => 
          !(msg.text === data.text && msg.sender === data.sender)
        )
      );
    });

    // Typing users handling
    socket.current.on("typing_users", (data) => {
      if (activeChat === 'general') {
        setTypingUsers(data);
      }
    });

    socket.current.on("typing_users_private", (data) => {
      if (activeChat !== 'general') {
        setTypingUsers(data);
      }
    });

    // Messages read notification
    socket.current.on("messages_read", ({ chatPartnerId, courseId: msgCourseId }) => {
      // Only process if for the current course
      if (msgCourseId !== courseId) return;
      
      setPrivateMessages(prev => {
        const partnerMessages = prev[chatPartnerId];
        if (!partnerMessages) return prev;
        
        return {
          ...prev,
          [chatPartnerId]: partnerMessages.map(msg => ({
            ...msg,
            read: true
          }))
        };
      });
    });

    // User status updates
    socket.current.on("user_status_update", ({ userId, status }) => {
      setUserCache(prev => {
        if (!prev[userId]) return prev;
        
        return {
          ...prev,
          [userId]: {
            ...prev[userId],
            status
          }
        };
      });
    });

    // New message notification
    socket.current.on("new_message_notification", ({ senderId, courseId: notifCourseId }) => {
      // Only process if for the current course
      if (notifCourseId !== courseId) return;
      
      // Increment unread count if not the active chat
      if (activeChat !== senderId) {
        setUnreadMessages(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }));
      }
    });

    return () => {
      socket.current.off("existing_messages");
      socket.current.off("receive_message");
      socket.current.off("private_existing_messages");
      socket.current.off("receive_private_message");
      socket.current.off("typing_users");
      socket.current.off("typing_users_private");
      socket.current.off("messages_read");
      socket.current.off("user_status_update");
      socket.current.off("new_message_notification");
    };
  }, [activeChat, pendingMessages, user, courseId]);

  // Load course users
  useEffect(() => {
    const loadCourseUsers = async () => {
      try {
        const users = await fetchCourseStudents(courseId, token);
        setCourseUsers(users);
        
        // Initialize user cache with course users
        const userCacheUpdate = {};
        users.forEach(user => {
          userCacheUpdate[user._id] = {
            name: user.name,
            imageurl: user.imageurl,
            role: user.role,
            status: 'offline' // Default to offline
          };
        });
        
        setUserCache(prev => ({
          ...prev,
          ...userCacheUpdate
        }));
      } catch (error) {
        console.error("Error loading course users:", error);
      }
    };
    
    if (courseId && token) {
      loadCourseUsers();
    }
  }, [courseId, token]);

  // Load user data for messages
  useEffect(() => {
    const loadUsers = async () => {
      const usersToFetch = new Set();

      // Check course messages
      courseMessages.forEach((msg) => {
        if (msg.sender && !userCache[msg.sender]) {
          usersToFetch.add(msg.sender);
        }
      });

      // Check private messages
      Object.values(privateMessages).flat().forEach((msg) => {
        if (msg.sender && !userCache[msg.sender]) {
          usersToFetch.add(msg.sender);
        }
        if (msg.receiver && !userCache[msg.receiver]) {
          usersToFetch.add(msg.receiver);
        }
      });

      if (usersToFetch.size === 0) return;

      for (const userId of usersToFetch) {
        try {
          const userData = await fetchUserById(userId, token);
          if (userData) {
            setUserCache(prev => ({
              ...prev,
              [userId]: {
                name: userData.name || "User",
                imageurl: userData.imageurl || null,
                role: userData.role || "student",
                status: 'unknown'
              }
            }));
          }
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
          setUserCache(prev => ({
            ...prev,
            [userId]: { name: "Unknown User", imageurl: null, status: 'unknown' }
          }));
        }
      }
    };

    if ((courseMessages.length > 0 || Object.keys(privateMessages).length > 0)) {
      loadUsers();
    }
  }, [courseMessages, privateMessages, token, userCache]);

  // Handle typing
  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isConnected || !user) return;
    
    if (!isTyping) {
      setIsTyping(true);
      
      if (activeChat === 'general') {
        socket.current.emit("typing", {
          courseId: courseId,
          isTyping: true
        });
      } else {
        socket.current.emit("typing_private", {
          receiverId: activeChat,
          courseId: courseId,
          isTyping: true
        });
      }
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      
      if (activeChat === 'general') {
        socket.current.emit("typing", {
          courseId: courseId,
          isTyping: false
        });
      } else {
        socket.current.emit("typing_private", {
          receiverId: activeChat,
          courseId: courseId,
          isTyping: false
        });
      }
    }, 2000);
  };

  // Send message handler
  const sendMessage = () => {
    if (message.trim() === "" || !isConnected) return;
    
    const tempId = `temp-${Date.now()}`;
    const messageText = message.trim();
    
    if (activeChat === 'general') {
      // Send course message
      const newMessage = {
        courseId: courseId,
        text: messageText,
      };
      
      const tempMessage = {
        ...newMessage,
        sender: user._id,
        tempId: tempId,
        _id: tempId,
        createdAt: new Date().toISOString(),
      };
      
      setCourseMessages(prev => [...prev, tempMessage]);
      setPendingMessages(prev => [...prev, tempMessage]);
      
      socket.current.emit("send_message", newMessage);
    } else {
      // Send private message
      const newMessage = {
        receiverId: activeChat,
        courseId: courseId,
        text: messageText,
      };
      
      const tempMessage = {
        ...newMessage,
        sender: user._id,
        receiver: activeChat,
        tempId: tempId,
        _id: tempId,
        createdAt: new Date().toISOString(),
        read: false
      };
      
      // Only add temporary message if it doesn't exist yet
      setPrivateMessages(prev => {
        const existingMessages = prev[activeChat] || [];
        const isDuplicate = existingMessages.some(msg => 
          msg.text === messageText && 
          msg.sender === user._id &&
          new Date(msg.createdAt).getTime() > Date.now() - 5000 // Within last 5 seconds
        );
        
        if (isDuplicate) return prev;
        
        return {
          ...prev,
          [activeChat]: [...existingMessages, tempMessage]
        };
      });
      
      setPendingMessages(prev => [...prev, tempMessage]);
      
      socket.current.emit("send_private_message", newMessage);
    }
    
    setMessage("");
    
    if (isTyping) {
      setIsTyping(false);
      
      if (activeChat === 'general') {
        socket.current.emit("typing", {
          courseId: courseId,
          isTyping: false
        });
      } else {
        socket.current.emit("typing_private", {
          receiverId: activeChat,
          courseId: courseId,
          isTyping: false
        });
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Select chat handler
  const handleSelectChat = (chatId) => {
    setActiveChat(chatId);
    
    // Reset unread count for this chat
    setUnreadMessages(prev => ({
      ...prev,
      [chatId]: 0
    }));
    
    // Join private chat room if needed
    if (chatId !== 'general' && isConnected) {
    //  console.log("Joining private chat with:", chatId);
      socket.current.emit("join_private_chat", { 
        receiverId: chatId,
        courseId: courseId
      });
    }
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isProfessorOrOwner = () => {
    return isOwner || user?.role === "professor";
  };

  const handleReconnect = () => {
    if (socket.current) {
      socket.current.connect();
    }
  };

  const formatTypingIndicator = () => {
    if (!typingUsers || typingUsers.length === 0) return null;
    
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  // Get current active messages
  const getActiveMessages = () => {
    if (activeChat === 'general') {
      return courseMessages;
    } else {
      return privateMessages[activeChat] || [];
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen relative">
      <ChatSidebar
        courseName={courseDetails.name}
        isOpen={sidebarOpen}
        isProfessorOrOwner={isProfessorOrOwner()}
        isConnected={isConnected}
        onReconnect={handleReconnect}
        courseUsers={courseUsers}
        courseProfessor={courseDetails.owner}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        currentUserId={user?._id}
        unreadMessages={unreadMessages}
        userCache={userCache}
      />

      <div className="flex-1 flex flex-col w-full">
        <ChatHeader
          courseName={courseDetails.name}
          isConnected={isConnected}
          isProfessorOrOwner={isProfessorOrOwner()}
          onReconnect={handleReconnect}
          activeChat={activeChat}
          toggleSidebar={toggleSidebar}
          userCache={userCache}
        />
        
        <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50">
          <ChatMessages
            messages={getActiveMessages()}
            currentUserId={user?._id}
            userCache={userCache}
            isPending={pendingMessages}
            isPrivateChat={activeChat !== 'general'}
            messageEndRef={messageEndRef}
          />
          
          <div className="h-6 text-sm text-gray-500 italic">
            {formatTypingIndicator()}
          </div>
          
          <div ref={messageEndRef} />
        </div>
        
        <div className="border-t border-gray-200 p-4 bg-white">
          <ChatMessageInput
            message={message}
            onChange={handleTyping}
            onSend={sendMessage}
            isConnected={isConnected}
            placeholder={`Message ${activeChat === 'general' ? 'everyone' : userCache[activeChat]?.name || 'user'}`}
          />
        </div>
      </div>
    </div>
  );
};
export default ChatApp;