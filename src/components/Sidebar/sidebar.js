import React, { useEffect, useContext, useState, useRef } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { IoHomeOutline } from "react-icons/io5";
import { BiMessageRounded } from "react-icons/bi";
import { VscAdd } from "react-icons/vsc";
import { GoBell } from "react-icons/go";
import { IoMdHeartEmpty } from "react-icons/io";
import AuthPopup from '../../auth/authPopup'
import { useSocket } from '../contexts/SocketContext';
import { NotificationContext } from '../contexts/NotificationContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { AiOutlineLogout, AiOutlineProduct } from "react-icons/ai";
import { RiApps2AddLine } from "react-icons/ri";
import './sidebar.css';
import '../../App.css';
import logo from '../../assets/icon/e-logo.png';

function SideBar() {
    const [isAuthPopup, setAuthPopup] = useState(false);
    const { totalUnseenMsgCount } = useSocket();
    const { unreadCount } = useContext(NotificationContext);
    const { wishlistCount } = useWishlist();
    const { user, isAuthenticated, setAuthenticated } = useAuth();
    const navigate = useNavigate();


    const addPost = () => {
        if (isAuthenticated) {
            navigate('/sell/product-details');
        } else {
            setAuthPopup(true)
        }
    };

    const logOut = async () => {
        localStorage.removeItem('userData');
        const user = JSON.parse(localStorage.getItem('userData'));
        if (!user) {
            setAuthenticated(false);
            navigate('/sign-in');
        }
    }

    const openChats = () => {
        if (isAuthenticated) {
            navigate('/chat');
        } else {
            setAuthPopup(true)
        }
    }


    const handleAuthPopup = (closePopup) => {
        setAuthPopup(closePopup);
    }

    return (
        <div className="sidebar-container">
            <div className='sidebar-item-container site-logo' onClick={()=>navigate('/')}>
                <img src={logo} className='sidebar-logo' />
            </div>
            <div className='sidebar-item-for-notify-icon'>
                <NavLink
                    to="/"
                    className={({ isActive }) => (isActive ? 'active-link sidebar-item-container' : 'sidebar-item-container')}
                >
                    <IoHomeOutline className="s-icon" />
                    <span className="sidebar-item">Home</span>
                </NavLink>
            </div>
            <div className='sidebar-item-for-notify-icon' onClick={openChats}>
                <div className='sidebar-item-container'>
                    <BiMessageRounded className="s-icon" />
                    <span className="sidebar-item">Chats</span>
                </div>
                {totalUnseenMsgCount > 0 && (
                    <div className='notify-icon'>
                        {totalUnseenMsgCount}
                    </div>)}
            </div>
            <div className='sidebar-item-for-notify-icon'>
                <NavLink
                    to="/account/wishlist"
                    className={({ isActive }) => (isActive ? 'active-link sidebar-item-container' : 'sidebar-item-container')}>
                    <IoMdHeartEmpty className='s-icon ' />
                    <span className='sidebar-item'>Wishlist</span>
                </NavLink>
                {wishlistCount > 0 && (
                    <div className='notify-icon'>
                        {wishlistCount}
                    </div>)}
            </div>
            <div className='sidebar-item-for-notify-icon'>
                <div className='sidebar-item-container ' onClick={addPost}>
                    <RiApps2AddLine className='s-icon' />
                    <span className='sidebar-item'>Add Sell</span>
                </div>
            </div>
            <div className='sidebar-item-for-notify-icon'>
                <NavLink
                    to="/account/notifications"
                    className={({ isActive }) => (isActive ? 'active-link sidebar-item-container' : 'sidebar-item-container')}>
                    <GoBell className='s-icon' />
                    <span className='sidebar-item'>Notifi..</span>
                </NavLink>
                {unreadCount > 0 && (
                    <div className='notify-icon'>
                        {unreadCount}
                    </div>)}
            </div>

            {
                isAuthPopup && (
                    <div className='auth-error-wrapper'>
                        <AuthPopup isClosed={handleAuthPopup} />
                    </div>

                )
            }

        </div >
    );
}
export default SideBar;