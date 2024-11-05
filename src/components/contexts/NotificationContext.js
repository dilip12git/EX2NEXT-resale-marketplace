import React, { createContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext.js'
import { useToast } from './ToastService'
import {useAuth} from './AuthContext'

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { socket } = useSocket();
    const { notifySuccess, notifyError, notifyWarning } = useToast();
    const {isAuthenticated,user}=useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications(user.userId);
        }
    }, [isAuthenticated]);
    
    useEffect(() => {
        if (!socket) return console.log("error in socket");
    
        const handleNotification = (notificationMessage) => {
            notifySuccess(`Notification from ${notificationMessage}`);
            if (user?.userId) {
                fetchNotifications(user.userId);
            }
        };
    
        socket.on('receiveNotification', handleNotification);
    
        return () => {
            socket.off('receiveNotification', handleNotification);
        };
    }, [socket, user?.userId]);
    
    const fetchNotifications = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5000/users/notifications/get-notifications/${userId}`);
            const data = await response.json();
            setNotifications(data || []);
            setUnreadCount(data.filter((notification) => !notification.isRead).length || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };
    

    const markAsRead = async (userId, notificationId) => {
        try {
            await fetch(`http://localhost:5000/users/notifications/markAsRead/${userId}/${notificationId}`, { method: 'PUT' });
            
            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) =>
                    notification._id === notificationId ? { ...notification, isRead: true } : notification
                )
            );
            
            setUnreadCount((prevCount) => prevCount > 0 ? prevCount - 1 : 0);
            
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };
    

    const value = {
        notifications,
        unreadCount,
        markAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
