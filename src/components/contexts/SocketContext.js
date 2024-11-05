// SocketContext.js
import React, { useContext, createContext, useMemo, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useToast } from './ToastService'
import { useAuth } from './AuthContext'
const socketContext = createContext(null);

let socket;
const getSocket = () => {
  if (!socket) {
    socket = io('http://localhost:3001');
  }
  return socket;
};

const SocketContext = ({ children }) => {
  const socket = useMemo(() => getSocket(), []);
  const [messages, setMessages] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [selectedChatUserId, setSelectedChatUserId] = useState('');
  const [selectedFilePrev, setSelectedFilePrev] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [productUrl, setProductUrl] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState();
  const { notifySuccess, notifyError, notifyWarning } = useToast();
  const [isCallbackRequest, setIsCallBackRequest] = useState(false);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [isBlockedMe, setIsblockedByMe] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatListLoading, setIsChatListLoading] = useState(true);
  const [totalUnseenMsgCount, setTotalUnseenMsgCount] = useState(0);
  const { isAuthenticated, user } = useAuth();
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentUserId(user.userId);
      if (socket) {
        socket.emit('joinChat', user.userId);
        socket.emit('activeUser', user.userId);
      }
    }

  }, [isAuthenticated, user, socket]);



  useEffect(() => {
    if (!socket) {
      console.error("Socket not connected");
      return;
    }
    const handleActiveUsers = (users) => {
      setActiveUsers(users);
    }
    socket.on('updateActiveUsers', handleActiveUsers);
    return () => {
      socket.off('updateActiveUsers', handleActiveUsers);
    };
  }, [socket,user]);


  useEffect(() => {
    if (!socket) {
      console.error("Socket not connected");
      return;
    }

    const handleMessageReceived = ({ senderId, receiverId, message, fileUrl, productUrl, timestamp }) => {
      fetchChatsLists();
      const isCurrentChat =
        (currentUserId === receiverId && selectedChatUserId === senderId) ||
        (currentUserId === senderId && selectedChatUserId === receiverId);

      if (isCurrentChat) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { senderId, receiverId, message, fileUrl, productUrl, timestamp },
        ]);
        
      }

      if (receiverId === currentUserId && !isCurrentChat) {
        notifySuccess("New message received");
      }

      if (selectedChatUserId) {
        fetchChatMessages(selectedChatUserId);
      

      }
    };

    socket.on('messageReceived', handleMessageReceived);
    return () => {
      socket.off('messageReceived', handleMessageReceived);
    };
  }, [socket, currentUserId, selectedChatUserId, isChatOpen]);


  const sendMessage = async (peerId, message, fileUrl, productUrl) => {
    if (socket) {
      socket.emit('privateMessage', {
        senderId: user.userId,
        receiverId: peerId,
        message,
        fileUrl,
        productUrl,
      });
    }
  };

  const fetchChatsLists = async () => {
    if (user.userId) {
      try {
        const response = await fetch(`http://localhost:3001/users/chatlists/chat-list/${user.userId}`);
        const data = await response.json();

        setTimeout(() => {
          setIsChatListLoading(false);
          setChatList(data.userDetails);
          // console.log(data.userDetails);
          setTotalUnseenMsgCount(data.totalUnseenCount)
        }, 1000);

      } catch (err) {
        notifyError('Error fetching chats:' + err)
        setIsChatListLoading(false);

      }
    }
  };


  const markMessagesAsSeen = async (chatId) => {
    try {
      await axios.put(`http://localhost:3001/users/chats/mark-seen/${chatId}`, { currentUserId });

      setChatList((prevList) => {
        let unseenMessagesCountToSubtract = 0;
        const updatedList = prevList.map((partner) => {
          if (partner.chatPartner.peerId === selectedChatUserId) {
            unseenMessagesCountToSubtract = partner.unseenMessagesCount;
            return {
              ...partner,
              ...partner.chatPartner,
              unseenMessagesCount: 0,

            };
          }
          return partner;
        });
        setTotalUnseenMsgCount((prevTotal) => prevTotal - unseenMessagesCountToSubtract);
        return updatedList;
      });


    } catch (error) {
      console.error('Error marking messages as seen:', error);
    }
  };


  const fetchChatMessages = async (peerId) => {
    if (peerId) {
      try {
        const response = await fetch(`http://localhost:3001/users/chats/${user.userId}/${peerId}`);
        if (!response.ok) throw new Error('Failed to fetch messages');

        const chat = await response.json();
        setChatId(chat.chat ? chat.chat._id : null);
        setMessages(chat.messages || []);
      } catch (err) {
        notifyError('Error fetching chats:' + err)
        setMessages([]);
      }
    }
  };

  const deleteMessage = async (messageId, senderId) => {
    if (messageId && senderId) {
      try {
        const response = await fetch(`http://localhost:3001/users/chats/delete-message/${messageId}?senderId=${senderId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (response.ok) {
          setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
          notifyWarning(data.message);
        }
      } catch (error) {
        notifyError('Failed to delete message:' + error)
      }
    }
  };
  const deleteChat = async () => {
    if (selectedChatUserId && currentUserId && chatId) {
      const userId = currentUserId;
      try {
        const response = await fetch(`http://localhost:3001/users/chats/delete-chat/${chatId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const result = await response.json();
          fetchChatMessages(selectedChatUserId);
          notifyWarning(result.message);
        }
      } catch (error) {
        notifyError('Error:' + error)

      }
    }

  };

  const blockUser = async () => {
    const userId = user.userId;
    if (selectedChatUserId) {
      try {
        const response = await fetch(`http://localhost:3001/users/auth/block-user/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blockedUserId: selectedChatUserId }),
        });

        if (!response.ok) {
          throw new Error('Failed to block/unblock user');
        }

        const data = await response.json();
        notifySuccess(data.message);
        if (socket) {
          socket.emit('blocked', { selectedChatUserId });
        }
        const userBlockedList = await fetchBlockedUsers(userId);
        setIsblockedByMe(userBlockedList.includes(selectedChatUserId));
      } catch (error) {
        notifyError('Error:' + error)

      }
    }
  };

  useEffect(() => {
    if (!socket) return console.log("error in socket");
    const notifyBlockedUser = async () => {
      if (selectedChatUserId) {
        const selectedUserBlockedList = await fetchBlockedUsers(selectedChatUserId);
        setIsUserBlocked(selectedUserBlockedList.includes(currentUserId));
      }
    };
    socket.on('notifyBlocked', notifyBlockedUser);
    return () => {
      socket.off('notifyBlocked', notifyBlockedUser);
    };
  }, [socket, selectedChatUserId, currentUserId]);

  const fetchBlockedUsers = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/users/auth/blocked-users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch blocked users');
      const data = await response.json();
      return data ? data.blockedUsers : [];
    } catch (error) {
      notifyError('Error fetching blocked users:' + error);
      return [];
    }
  };
  const sendCallbackRequest = async () => {
    const sendData = {
      buyerName: user.name,
      buyerEmail: user.email,
      buyerPhoneNumber: user.phoneNumber,
      currentUserId: currentUserId,
      profile: user.profile,
      sellerEmail: selectedUser.email,
      sellerUserId: selectedChatUserId,
    }
    if (sendData) {
      setIsRequesting(true);
      try {
        const response = await fetch('http://localhost:5000/users/send-call-back-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sendData),
        });
        const data = await response.json();
        if (response.ok) {
          notifySuccess(data.message);
          if (socket) {
            const name = selectedUser.name;
            socket.emit('sendNotification', { selectedChatUserId, name });
          }
          setIsRequesting(false);
          setIsCallBackRequest(false);
        }
        else {
          notifyError(data.message);
          setIsRequesting(false);

        }

      } catch (err) {
        notifyError(err);
        setIsRequesting(false);
        throw err;

      }
    }
    else {
      notifyError("Try again");
    }
  };

  useEffect(() => {
    const fetchBlockedStatus = async () => {
      if (selectedChatUserId) {
        const userBlockedList = await fetchBlockedUsers(currentUserId);
        const selectedUserBlockedList = await fetchBlockedUsers(selectedChatUserId);
        setIsblockedByMe(userBlockedList.includes(selectedChatUserId));
        setIsUserBlocked(selectedUserBlockedList.includes(currentUserId));
      }

    };

    fetchBlockedStatus();
  }, [currentUserId, selectedChatUserId]);

  useEffect(() => {
    if (currentUserId)
      fetchChatsLists();
  }, [])
  return (
    <socketContext.Provider
      value={{
        socket,
        sendMessage,
        messages,
        chatList,
        selectedChatUserId,
        setSelectedChatUserId,
        fetchChatsLists,
        fetchChatMessages,
        deleteMessage,
        blockUser,
        isUserBlocked,
        isBlockedMe,
        isRequesting,
        selectedFilePrev,
        setSelectedFilePrev,
        selectedFile,
        setSelectedFile,
        productUrl,
        setProductUrl,
        deleteChat,
        fetchBlockedUsers,
        currentUserId,
        isCallbackRequest,
        setIsCallBackRequest,
        setIsUserBlocked,
        setIsblockedByMe,
        setCurrentUserId,
        sendCallbackRequest,
        setSelectedUser,
        selectedUser,
        chatId,
        setChatId,
        isChatOpen,
        setIsChatOpen,
        isChatListLoading,
        markMessagesAsSeen,
        setChatList,
        totalUnseenMsgCount,
        activeUsers
      }}
    >
      {children}
    </socketContext.Provider>
  );
};

export default SocketContext;

export const useSocket = () => {
  return useContext(socketContext);
};












