import React, { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import './notification.css';
import { useNavigate } from 'react-router-dom';
import userIcon from '../../assets/icon/user-icon.png';
import { ReactComponent as NotificationSVG } from '../../assets/SVG/notification.svg';
import { IoEllipsisVertical } from "react-icons/io5";
import { GoDotFill } from "react-icons/go";
import { formatDistanceToNow } from 'date-fns';
import { BsChat } from "react-icons/bs";
import { useAuth } from '../contexts/AuthContext';
function Notifications() {
  const { notifications, unreadCount, markAsRead } = useContext(NotificationContext);
  const [isLoading, setIsLoading] = useState(true);
  const {user}=useAuth();
  const navigate=useNavigate();




  const handleProfileImageError = (event) => {
    event.target.src = userIcon;
  };
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1000);
  }, [])

  return (
    <div className='notification-container'>
      {isLoading ? (
        <div className='home skeleton-home'>
          <div className='acc-title skeleton-title skeleton-animation'></div>
          <div className='notification-wrapper'>
            {Array(5).fill().map((_, index) => (
              <div key={index} className='notification-item'>
                <div className='notification-img-wrapper skeleton-animation'></div>
                <div className='notification-info-wrapper skeleton-info-wrapper'>
                  <span className=' skeleton-notification-title skeleton-animation'></span>
                  <span className='skeleton-notification-desc skeleton-animation'></span>
                  <span className=' skeleton-notification-date skeleton-animation'></span>
                </div>
                <div className='notification-icon-wrapper'>
                  <div className='skeleton-icon skeleton-animation'></div>
                  <div className=' skeleton-icon skeleton-animation'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {notifications.length > 0 ? (
            <div className='notification-wrapper'>
              <div className='acc-title'>Notifications ({unreadCount} unread)</div>

              {notifications.map(({ _id, isRead, profile, title, desc, createDate, phone, email, senderName, senderId }) => (
                <div
                  key={_id}
                  className={`notification-item ${isRead ? 'read' : 'unread'}`}
                  
                >
                  <div className='notficaiton-user-profile'>
                    <img
                      className='notification-user-profile-img'
                      src={profile || userIcon}
                      onError={handleProfileImageError}
                    />
                  </div>
                  <div className='notification-info'>
                    <span className='notification-title'>{title || ''}</span>
                    <span className='notification-desc'>{desc || ''}</span>
                    <span className='notification-date'>
                      {createDate ? formatDistanceToNow(new Date(createDate), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <div className='notification-icon-wrapper'>
                    {!isRead && <GoDotFill size={18} className='dot-icon' color='#0066FF' />}
                    {senderId ? <button className='notification-btn' onClick={() => !isRead && markAsRead(user.userId,_id)} ><BsChat size={15} onClick={()=>navigate('/chats')} /></button> : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='profile-post-not-found-error'>
              <NotificationSVG width={150} height={150} style={{ alignSelf: 'center' }} />
              <span className='no-post-error-text' style={{ marginTop: '-25px' }}>Sorry, no notifications were found.</span>
            </div>
          )}
        </>)}
    </div>
  );
}

export default Notifications;
