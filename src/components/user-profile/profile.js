import React, { useEffect, useState, useRef } from "react";
import userIcon from '../../assets/icon/user-icon.png';
import { ReactComponent as SignInSVG } from '../../assets/SVG/sign-in-svg.svg';
import { ReactComponent as NoProductFound } from '../../assets/SVG/no-post.svg';
import { useNavigate } from 'react-router-dom';
import { RiUserSettingsLine } from "react-icons/ri";
import { IoEllipsisHorizontal, IoCheckmarkCircleOutline } from "react-icons/io5";
import { PiTrashLight } from "react-icons/pi";
import { TbListDetails } from "react-icons/tb";
import { LiaEdit } from "react-icons/lia";
import { useLocation } from '../contexts/LocationContext';
import { useToast } from '../contexts/ToastService';
import { useAuth } from '../contexts/AuthContext';
import './style.css';
function Profile() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [activeTab, setActiveTab] = useState('post');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openPostOptionId, setOpenPostOptionId] = useState(null);
    const iconRefs = useRef([]);
    const optionRefs = useRef([]);
    const { currentLocation } = useLocation();
    const [deletingPid, setDeletingPid] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const { notifySuccess, notifyWarning } = useToast();


    useEffect(() => {
        if (user.userId) fetchUserProducts(user.userId);
    }, []);

    const fetchUserProducts = async (userId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/users/post/user-post?userId=${userId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setProducts(data);
            setIsLoading(false);

        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markedSold = async (productId, isSold) => {

        try {

            const response = await fetch(`http://localhost:5000/users/post/products/update-status/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isSold: !isSold
                })
            });
            const data = await response.json();
            if (response.ok) {
                notifySuccess(data.msg);
                setProducts((prevProducts) =>
                    prevProducts.map((product) =>
                        product.productId === productId
                            ? { ...product, productStatus: { isSold: !product.productStatus.isSold } }
                            : product
                    )
                );
            } else {
                notifyWarning('Failed to update product status');
            }
        } catch (err) {
            notifyWarning('Error updating product status');
        }
    }

    const deleteItem = async () => {
        if (deletingPid) {
            try {
                const response = await fetch(`http://localhost:5000/users/post/product/delete-product/${deletingPid}`, {
                    method: 'DELETE', 
                });
                if (response.ok) {
                    notifySuccess("Item deleted");
                    setProducts(prevProducts => prevProducts.filter(product => product.productId !== deletingPid));
                    setDeletingPid(null);
                    setShowDeletePopup(false);
                }

            } catch (error) {
                notifyWarning(`Error:${error}`);

            }
        }


    }

    const openItem = (product) => {
        if (product) {
            const pDetails = `${product.category}-${product.title}`
                .replace(/[\s,]+/g, '-');
            const url = `${pDetails}-pid-${product.productId}`;
            navigate(`/item/${url}`);
        }

    }


    const handleProfileImageError = (event) => {
        event.target.src = userIcon;
    };
    const handleEditPostClick = (item) => {
        if (item) {
            navigate('/account/edit-product-item', { state: { item } });
        }

    }

    const togglePostOptions = (productId, index, event) => {
        event.stopPropagation();
        setOpenPostOptionId(openPostOptionId === productId ? null : productId);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openPostOptionId &&
                !iconRefs.current.some(ref => ref?.contains(event.target)) &&
                !optionRefs.current.some(ref => ref?.contains(event.target))) {
                setOpenPostOptionId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openPostOptionId]);

    return (
        <>
            {isAuthenticated ? (
                <div className='profile-container'>
                    <div className='profile-info-wrapper'>
                        <div className='profile-picture-wrapper'>
                            <img src={user.profile || userIcon} className="profile-picture" onError={handleProfileImageError} alt="user profile" />
                        </div>
                        <div className="profile-info-and-edit-btn-wrapper">
                            <div className='profile-info'>
                                <span className="profile-user-name">{user.name}</span>
                                <div className="profile-user-email-and-number-wrapper">
                                    <span>{user.email}</span>
                                    <div className='dot'></div>
                                    <span>{user.phoneNumber}</span>
                                </div>
                                <div className="profile-user-address">
                                    <span>{currentLocation?.address}</span>
                                </div>
                            </div>
                            <button className='profile-edit-btn' onClick={() => navigate('/account/edit-profile')}>
                                <RiUserSettingsLine className='profile-edit-icon' />
                                <span>Edit Profile</span>
                            </button>
                        </div>
                    </div>
                    <div className='profile-content-wrapper'>
                        <div className='profile-post-tab'>
                            <div className={`profile-post-tab-item ${activeTab === 'post' ? 'active' : ''}`} onClick={() => setActiveTab('post')}>
                                <span>Post</span>
                            </div>
                            <div className={`profile-post-tab-item ${activeTab === 'category' ? 'active' : ''}`} onClick={() => setActiveTab('category')}>
                                <span>Category</span>
                            </div>
                        </div>
                        <div>
                            {isLoading ? (
                                <div className='home skeleton-home'>
                                    <div className='profile-user-post-wrapper'>
                                        {Array(5).fill(0).map((_, index) => (
                                            <div key={index} className='profile-product-item skeleton-item'>
                                                <div className='profile-post-img-wrapper skeleton-animation'></div>
                                                <div className='profile-post-info-wrapper skeleton-info-wrapper'>
                                                    <span className='profile-post-price skeleton-price skeleton-animation'></span>
                                                    <span className='profile-post-title skeleton-product-title skeleton-animation'></span>
                                                    <span className='profile-post-location skeleton-product-address skeleton-animation'></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : products.length === 0 ? (
                                <div className='profile-post-not-found-error'>
                                    <NoProductFound width={150} height={150} style={{ alignSelf: 'center' }} />
                                    <span className="no-post-error-text" style={{ marginTop: '-25px' }}>Sorry, no posts were found.</span>
                                    <button className='close-auth-popup' onClick={() => navigate('/sell/product-details')}>Add Post</button>
                                </div>
                            ) : (
                                <div className="profile-post-content">
                                    {activeTab === 'post' && (
                                        <div className="profile-post-wrapper">
                                            <div className='profile-user-post-wrapper'>
                                                {products.map((product, index) => (
                                                    <div key={product._id} className='profile-product-item'>
                                                        {product.images.length > 0 && (
                                                            <div className='profile-post-img-wrapper' onClick={()=>openItem(product)}>
                                                                <img className='profile-post-img' src={product.images[0]} alt={product.title} loading='lazy' />
                                                            </div>
                                                        )}
                                                        <div className='profile-post-info-wrapper'>
                                                            <span className='profile-post-price' onClick={()=>openItem(product)}>{product.price}</span>
                                                            <span className='profile-post-title' onClick={()=>openItem(product)}>{product.title}</span>
                                                            <div className='profile-post-location-and-sold-btn-wrapper'>
                                                                <div className='profile-post-location-wrapper' onClick={()=>openItem(product)}>
                                                                    {/* <SlLocationPin className='profile-post-location-icon' /> */}
                                                                    <span className='profile-post-location'>{product.address}</span>
                                                                </div>
                                                                <button className={`profile-post-mark-as-sold-btn ${product.productStatus.isSold ? 'sold' : 'available'}`} onClick={() => markedSold(product.productId, product.productStatus.isSold)}>
                                                                    {product.productStatus.isSold ? <span>SOLD</span> : <span>Mark as sold</span>}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className='profile-post-option-wrapper'>
                                                            <div className='profile-post-option-icon-wrapper' onClick={(event) => togglePostOptions(product._id, index, event)} ref={(el) => (iconRefs.current[index] = el)}>
                                                                <IoEllipsisHorizontal />
                                                            </div>
                                                            {openPostOptionId === product._id && (
                                                                <div className='profile-post-option' ref={(el) => (optionRefs.current[index] = el)}>
                                                                       
                                                                    <div className='profile-post-option-item' onClick={() =>{ markedSold(product.productId, product.productStatus.isSold); setOpenPostOptionId(null); }}>
                                                                        <IoCheckmarkCircleOutline className='profile-post-option-item-icon' />
                                                                        <div className="profile-post-option-item-name"> {product.productStatus.isSold ? <span>Mark as unsold</span> : <span>Mark as sold</span>}</div>
                                                                    </div>
                                                                    {!product.productStatus.isSold &&
                                                                        <div className='profile-post-option-item' onClick={() => { handleEditPostClick(product) }}>
                                                                            <LiaEdit className='profile-post-option-item-icon' />
                                                                            <span className="profile-post-option-item-name">Edit post</span>
                                                                        </div>
                                                                    }
                                                                    <div className='profile-post-option-item' onClick={()=>openItem(product)}>
                                                                        <TbListDetails className='profile-post-option-item-icon' />
                                                                        <span className="profile-post-option-item-name">View details</span>
                                                                    </div>
                                                                    <div 
                                                                    className='profile-post-option-item post-delete-item' 
                                                                    onClick={() => { 
                                                                        setShowDeletePopup(true); 
                                                                        setDeletingPid(product.productId);
                                                                        setOpenPostOptionId(null); 
                                                                        }}>
                                                                        <PiTrashLight className='profile-post-option-item-icon' />
                                                                        <span className="profile-post-option-item-name">Delete Post</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'category' && (
                                        <div className="profile-category-wrapper">
                                            {Object.entries(
                                                products.reduce((acc, product) => {
                                                    acc[product.category] = { count: (acc[product.category]?.count || 0) + 1 };
                                                    return acc;
                                                }, {})
                                            ).map(([category, { count }]) => (
                                                <div className='profile-category-item' key={category}>
                                                    <span>{category}</span>
                                                    <span>{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="user-sign-in-error-wrapper">
                    <SignInSVG width={150} height={150} style={{ alignSelf: 'center' }} />
                    <span>Please sign in to continue accessing your personalized content.</span>
                    <button className='close-auth-popup' onClick={() => navigate('/sign-in')}>Sign In</button>
                </div>
            )}
            {showDeletePopup && (
                <div className=' delete-popup-container'>
                    <div className='de-popup'>
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to delete this item? This action will permanently remove the item.</p>
                        <div className="de-btn-cntr">
                            <button onClick={() => {setShowDeletePopup(false); setDeletingPid(null);}}>Cancel</button>
                            <button onClick={deleteItem}>Yes, Delete</button>
                        </div>

                    </div>

                </div>
            )}
        </>
    );
}

export default Profile;
