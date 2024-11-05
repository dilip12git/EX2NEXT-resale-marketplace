import './styles.css';
import React, { useEffect, useContext, useState, useRef } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { LiaAngleDownSolid } from "react-icons/lia";
import { CiSearch } from "react-icons/ci";
import { IoHomeOutline, IoSettings } from "react-icons/io5";
import { SlLocationPin } from "react-icons/sl";
import { BiMessageRounded, BiUser } from "react-icons/bi";
import { VscAdd } from "react-icons/vsc";
import { GoBell } from "react-icons/go";
import { LuUser2 } from "react-icons/lu";
import BeatLoader from "react-spinners/BeatLoader";
import { IoClose } from "react-icons/io5";
import logo from '../../assets/icon/e-logo.png'
import userIcon from '../../assets/icon/user-icon.png'
import { FaUserCircle } from "react-icons/fa";
import { IoMdHeartEmpty } from "react-icons/io";
import UpdateLocation from '../UpdateLocation/UpdateLocation';
import AuthPopup from '../../auth/authPopup'
import { useSocket } from '../contexts/SocketContext';
import { NotificationContext } from '../contexts/NotificationContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useLocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';
import { LiaUserEditSolid } from "react-icons/lia";
import { AiOutlineLogout, AiOutlineProduct } from "react-icons/ai";
import { MdOutlineEditLocation } from "react-icons/md";
import { RiApps2AddLine } from "react-icons/ri";
function Header() {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();
    const [isUpdateLocation, setIsUpdateLocation] = useState(false);
    const [isAuthPopup, setAuthPopup] = useState(false);
    const { totalUnseenMsgCount } = useSocket();
    const { unreadCount } = useContext(NotificationContext);
    const { wishlistCount } = useWishlist();
    const { currentLocation } = useLocation();
    const { user, isAuthenticated, setAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');


    const handleCanceledPopup = (isCancled) => {
        setIsUpdateLocation(isCancled);

    }
    const addPost = () => {
        if (isAuthenticated) {
            navigate('/sell/product-details');
        } else {
            setAuthPopup(true)
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                profileRef.current && !profileRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleProfileClick = () => {
        setMenuOpen(!menuOpen);
    };

    const toggleSearchBar = () => {
        setIsSearchVisible(!isSearchVisible);
    };

    const closeSearchBar = () => {
        setIsSearchVisible(false);
    };


    const gotHome = () => {
        navigate('/');
    };


    const logOut = async () => {
        localStorage.removeItem('userData');
        const user = JSON.parse(localStorage.getItem('userData'));
        if (!user) {
            setAuthenticated(false);
            navigate('/sign-in');
        }
    }
    const handleProfileImageError = (event) => {
        event.target.src = userIcon;
    }
    const handleAuthPopup = (closePopup) => {
        setAuthPopup(closePopup);
    }
    const openChats = () => {
        if (isAuthenticated) {
            navigate('/chat');
        } else {
            setAuthPopup(true)
        }
    }


    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSearchClick = () => {
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);

        }
    };

    return (
        <div className="h-container">
            <div className='logo-and-location-wrapper'>
                <div className='h-sidebar-item-container h-site-logo' onClick={() => navigate('/')}>
                    <img src={logo} className='h-sidebar-logo' />
                </div>
                {currentLocation ? (
                    <div className='location-container' onClick={() => setIsUpdateLocation(true)}>
                        <div className='main-city-name-container'>
                            <SlLocationPin className='location-icon' />
                            <span className='city-name'>{currentLocation.city}</span>
                            <LiaAngleDownSolid />
                        </div>
                        <div className='full-address-container'>
                            <span className='full-address'>{currentLocation.address}</span>
                        </div>
                    </div>
                ) : (
                    <BeatLoader
                        color="#0066FF"
                        size={7}
                    />
                )}
            </div>
            <div className='header-search-icon' onClick={toggleSearchBar}>
                <CiSearch className='icon search-icon' />
            </div>
            <div className='nav'>
                <div className={`searchbar-container ${isSearchVisible ? 'show' : ''}`}>
                    <div className='searchbar'>
                        <input
                            className='search-input'
                            type='text'
                            placeholder='What do you want to buy?'
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyPress}
                        />
                        <CiSearch
                            className='icon search-icon'
                            onClick={handleSearchClick}
                            disabled={!searchQuery.trim()}
                        />
                    </div>
                    <div className='close-search-bar' onClick={closeSearchBar}>
                        <IoClose />
                    </div>
                </div>
               
                <div>
                    {isAuthenticated ? (
                        <div className="authenticated-user-profile ">
                            <div className="auth-profile" ref={profileRef} onClick={handleProfileClick}>
                                {user && user.profile ? (
                                    <img src={user.profile} alt="User Profile" className='auth-user-profile-img' onError={handleProfileImageError} />
                                ) : (
                                    <FaUserCircle className='user-icon' />
                                )}
                            </div>
                            <div className={`header-side-menu-container ${menuOpen ? 'open' : ''}`} ref={menuRef}>
                                <div className='user-profile-card'>
                                    <div className='menu-profile'>
                                        <img
                                            src={user.profile ? user.profile : userIcon}
                                            onError={handleProfileImageError}
                                            className='auth-user-profile-img'
                                        />
                                        <span className='auth-user-name'>{user.name}</span>
                                    </div>
                                    <span
                                        className='profile-see-all-profile'
                                        onClick={() => {
                                            navigate('/account');
                                            handleProfileClick();
                                        }}>See profile</span>
                                </div>
                                <div className='menu-items-wrapper'>
                                    <div className='menu-item' onClick={() => { { navigate('/account'); handleProfileClick(); } }}>
                                        <BiUser className='menu-icon' />
                                        <span className='menu-title'>Acount</span>
                                    </div>
                                    <div className='menu-item' onClick={() => { { navigate('/account/profile'); handleProfileClick(); } }}>
                                        <AiOutlineProduct className='menu-icon' />
                                        <span className='menu-title'>My post</span>
                                    </div>
                                    <div className='menu-item' onClick={() => { { navigate('/account/edit-profile'); handleProfileClick(); } }}>
                                        <LiaUserEditSolid className='menu-icon' />
                                        <span className='menu-title'>Edit profile</span>
                                    </div>
                                    <div className='menu-item' onClick={() => { { setIsUpdateLocation(true); handleProfileClick(); } }}>
                                        <MdOutlineEditLocation className='menu-icon' />
                                        <span className='menu-title'>Manage address</span>
                                    </div>
                                </div>
                                <div className='menu-item menu-user-logout' onClick={() => { { logOut(); handleProfileClick(); } }}>
                                    <AiOutlineLogout className='menu-icon' />
                                    <span className='menu-title'>Logout</span>
                                </div>

                            </div>

                        </div>
                    ) : (
                        <Link className='user-profile-container' to="/sign-in">
                            <span className='nav-link sign-btn'>Sign In</span>
                        </Link>
                    )}
                </div>
            </div>
            {
                isUpdateLocation && (
                    <div className='p-update-location-wrapper'>
                        <UpdateLocation canceled={handleCanceledPopup} />
                    </div>

                )
            }
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
export default Header;