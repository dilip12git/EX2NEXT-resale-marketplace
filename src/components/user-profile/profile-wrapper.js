import './style.css';
import React, { useEffect, useContext,useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useNavigate, NavLink } from 'react-router-dom';
import userIcon from '../../assets/icon/user-icon.png'
import { RiUserSettingsLine } from "react-icons/ri";
import { MdOutlineEditLocation } from "react-icons/md";
import { IoMdHeartEmpty } from "react-icons/io";
import { CiUser } from "react-icons/ci";
import { FaPowerOff } from "react-icons/fa6";
import { GoBell } from "react-icons/go";
import { IoChatbubblesOutline } from "react-icons/io5";
import { useAuth } from '../contexts/AuthContext';
import { NotificationContext } from '../contexts/NotificationContext';
import { useSocket } from '../contexts/SocketContext';
import { useWishlist } from '../contexts/WishlistContext';
import UpdateLocation from '../UpdateLocation/UpdateLocation';
import {useToast} from '../contexts/ToastService'
function ProfileWrapper() {
    const navigate = useNavigate();
    const { isAuthenticated, user, setAuthenticated } = useAuth();
    const { totalUnseenMsgCount } = useSocket();
    const {notifyWarning} =useToast();
    const { unreadCount } = useContext(NotificationContext);
    const { wishlistCount } = useWishlist();
    const [isUpdateLocation, setIsUpdateLocation] = useState(false);
    

    const handleCanceledPopup = (isCancled) => {
        setIsUpdateLocation(isCancled);

    }

    const handleProfileImageError = (event) => {
        event.target.src = userIcon;
    }

    const logOut = () => {
        localStorage.removeItem('userData');
        const data = JSON.parse(localStorage.getItem('userData'));
        if (!data) {
            setAuthenticated(false);
            navigate('/sign-in');
        }
    }
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            notifyWarning("Sign required!");
        }
    }, [isAuthenticated, user]);
    

    return (

        <div className="account-wrapper">
            <div className="acc-sidebar">
                <div className='acc-profile-wrapper'>
                    <div className='acc-user-profile' onClick={() => navigate('/account')}>
                        <img
                            className='acc-user-profile-picture'
                            src={isAuthenticated ? user.profile : userIcon}
                            onError={handleProfileImageError}
                            alt='user profile pciture'
                        />
                        <div className='acc-user-info'>
                            <span className='acc-user-name'>{isAuthenticated ? user.name : "Guest user"}</span>
                            <div className='acc-user-email'>{isAuthenticated ? user.email : 'Please sign in'}</div>
                        </div>
                    </div>
                    <div className='acc-setting-wrapper'>
                        <div className='acc-setting-item-wrapper'>
                            <NavLink
                                to="/account/profile"
                                className={({ isActive }) => (isActive ? 'active-setting-item acc-setting-item' : 'acc-setting-item')}>
                                <CiUser className='acc-setting-icon' />
                                <span className='ac-seting-item-title'>Profile</span>
                            </NavLink>
                            <NavLink
                                to="/account/wishlist"
                                className={({ isActive }) => (isActive ? 'active-setting-item acc-setting-item' : 'acc-setting-item')}>
                                <IoMdHeartEmpty className='acc-setting-icon' />
                                <span className='ac-seting-item-title'>Wishlists</span>
                                {wishlistCount >0 && <div className='notify-icon-wrapper'>{wishlistCount}</div>}
                            </NavLink>
                            <NavLink
                                to="/chat"
                                className={({ isActive }) => (isActive ? 'active-setting-item acc-setting-item' : 'acc-setting-item')}>
                                <IoChatbubblesOutline className='acc-setting-icon' />
                                <span className='ac-seting-item-title'>Chats</span>
                                {totalUnseenMsgCount >0 && <div className='notify-icon-wrapper'>{totalUnseenMsgCount}</div>}
                            </NavLink>
                            <NavLink
                                to="/account/notifications"
                                className={({ isActive }) => (isActive ? 'active-setting-item acc-setting-item' : 'acc-setting-item')}>
                                <GoBell className='acc-setting-icon' />
                                <span className='ac-seting-item-title'>Notifications</span>
                                {unreadCount >0 && <div className='notify-icon-wrapper'>{unreadCount}</div>}
                            </NavLink>
                        </div>
                    </div>

                    <div className='acc-setting-wrapper'>
                        <span className='acc-setting-title'>Account setting</span>
                        <div className='acc-setting-item-wrapper'>
                            <NavLink
                                to="/account/edit-profile"
                                className={({ isActive }) => (isActive ? 'active-setting-item acc-setting-item' : 'acc-setting-item')}>
                                <RiUserSettingsLine className='acc-setting-icon' />
                                <span className='ac-seting-item-title'>Profile Information</span>
                            </NavLink>
                            <div
                                onClick={() => setIsUpdateLocation(true)}
                                className='acc-setting-item'>
                                <MdOutlineEditLocation className='acc-setting-icon' />
                                <span className='ac-seting-item-title'>Manage Addresses</span>
                            </div>
                        </div>
                    </div>
                    {isAuthenticated && (
                        <div className='acc-setting-wrapper' onClick={logOut}>
                            <div className='acc-setting-item-wrapper'>
                                <div className='acc-setting-item'>
                                    <FaPowerOff className='acc-setting-icon' />
                                    <span className='ac-seting-item-title'>Log Out</span>
                                </div>
                            </div>
                        </div>)}

                </div>
            </div>
            <div className='outlet-wrapper'>
                <Outlet />
            </div>

            {
                isUpdateLocation && (
                    <div className='p-update-location-wrapper'>
                        <UpdateLocation canceled={handleCanceledPopup} />
                    </div>

                )
            }
        </div >
    )
}
export default ProfileWrapper;