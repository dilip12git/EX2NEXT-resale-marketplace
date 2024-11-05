import './style.css';
import React, { useEffect } from "react";
import { ReactComponent as SignInSVG } from '../../assets/SVG/sign-in-svg.svg';
import { ReactComponent as NoProductFound } from '../../assets/SVG/no-post.svg';
import { useNavigate } from 'react-router-dom';
import { SlLocationPin } from "react-icons/sl";
import { IoMdHeart } from "react-icons/io";
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
function Wishlist() {
    const { isLoading, wishlist, handleRemove, fetchWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
 
    useEffect(() => {
        fetchWishlist();
    }, [isAuthenticated]);

    const openItem = (product) => {
            if (product) {
                const pDetails = `${product.category}-${product.title}`
                    .replace(/[\s,]+/g, '-');
                const url = `${pDetails}-pid-${product.productId}`;
                navigate(`/item/${url}`);
            }
  
    }
    return (
        <div>
            {isAuthenticated ? (
                <div className='wishlist-container'>
                    {isLoading ? (
                        <div className='home skeleton-home'>
                            <div className='h-fTitle skeleton-title skeleton-animation'></div>
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
                    ) : wishlist.length === 0 ? (
                        <div className='profile-post-not-found-error'>
                            <NoProductFound width={150} height={150} style={{ alignSelf: 'center' }} />
                            <span className="no-post-error-text" style={{ marginTop: '-25px' }}>Sorry, no wishlist were found.</span>

                        </div>
                    ) : (
                        <div className="profile-post-wrapper">
                            <div className='acc-title'>Wishlists</div>
                            <div className='profile-user-post-wrapper'>
                                {wishlist.map((product) => (
                                    <div key={product.productId} className='profile-product-item'  >
                                        {product.productDetails.images.length > 0 && (
                                            <div className='profile-post-img-wrapper' onClick={()=>openItem(product.productDetails)}>
                                                <img className='profile-post-img' src={product.productDetails.images[0]} alt={product.title} loading='lazy' />
                                            </div>
                                        )}
                                        <div className='profile-post-info-wrapper' onClick={()=>openItem(product.productDetails)}>
                                            <span className='profile-post-price'>{product.productDetails.price}</span>
                                            <span className='profile-post-title'>{product.productDetails.title}</span>
                                            <div className='profile-post-location-and-sold-btn-wrapper'>
                                                <div className='profile-post-location-wrapper'>
                                                    <SlLocationPin className='profile-post-location-icon' />
                                                    <span className='profile-post-location'>{product.productDetails.address}</span>
                                                </div>
                                                <button className={`profile-post-mark-as-sold-btn ${product.productDetails.productStatus.isSold ? 'sold' : 'available'}`}>
                                                    {product.productDetails.productStatus.isSold ? <span>SOLD</span> : <span>Available</span>}
                                                </button>
                                            </div>
                                        </div>
                                        <div className='profile-post-option-wrapper'>
                                            <div className='h-product-like-icon-wrapper' onClick={() => handleRemove(product.productId)}>
                                                <IoMdHeart color='red' className='h-product-like-icon' />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div></div>
                    )}
                </div>

            ) : (
                <div className="user-sign-in-error-wrapper">
                    <SignInSVG width={150} height={150} style={{ alignSelf: 'center' }} />
                    <span>Please sign in to continue accessing your personalized content.</span>
                    <button className='close-auth-popup' onClick={() => navigate('/sign-in')}>Sign In</button>
                </div>
            )}


        </div>
    )
}
export default Wishlist;