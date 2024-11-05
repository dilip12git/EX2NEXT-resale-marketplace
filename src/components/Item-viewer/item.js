import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { useSwipeable } from 'react-swipeable';
import { TfiAngleRight, TfiAngleLeft } from "react-icons/tfi";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { ImLocation2 } from "react-icons/im";
import './item.css'
import userIcon from '../../assets/icon/user-icon.png';
import { ReactComponent as NoProductFound } from '../../assets/SVG/no-post.svg';
import { CiChat2, CiLocationOn } from "react-icons/ci";
import AuthPopup from '../../auth/authPopup'
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '../contexts/ToastService';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../contexts/AuthContext';
import { PiShareFatThin } from "react-icons/pi";
import { IoChatbubbleOutline } from "react-icons/io5";
const Item = () => {
    const { url } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchWishlist, wishlist, handleRemove } = useWishlist();
    const productId = url.split('-pid-')[1];
    const [productItem, setProductItem] = useState({});
    const { notifyError, notifySuccess, notifyWarning } = useToast();
    const [relatedProductItem, setRelatedProductItem] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [imgCurrentIndex, setImgCurrentIndex] = useState(0);
    const [postedUser, setPostedUser] = useState({});
    const [wishlistStatus, setWishlistStatus] = useState({});
    const [isAddingWishList, setIsAddingWishList] = useState(false);
    const { isAuthenticated, user } = useAuth();
    const [isAuthPopup, setAuthPopup] = useState(false);
    const [scale, setScale] = useState(1);
    const [isOpenItemLoading, setIsOpenItemLoading] = useState(true);
    const [isRelatedItemLoading, setIsRelatedItemLoading] = useState(true);
    const [isWishlist, setWishlist] = useState(false);



    const fetchProductItem = async (productId) => {
        try {
            const response = await fetch(`http://localhost:5000/users/post/product-item/${productId}`);


            if (!response.ok) {
                notifyError(response.message);
                setIsOpenItemLoading(true);
            }
            const product = await response.json();
            setProductItem(product);
            setProductImages(product.images);
            setPostedUser(product.user);
            checkWishList(product);
            setTimeout(() => {
                setIsOpenItemLoading(false);

            }, 1000)

            if (product.category && product.location) {
                fetchRelatedItem(product.category, product.location, product.productId);
            }

        } catch (error) {
            console.error('Error fetching product:', error);
            notifyError(error);

        }
    };
    const fetchRelatedItem = async (category, location, productId) => {
        if (category && location) {
            const [longitude, latitude] = location.coordinates;

            try {
                const response = await fetch(
                    `http://localhost:5000/users/post/related-product-items/nearby?lat=${latitude}&lng=${longitude}&category=${encodeURIComponent(category)}`
                );
                if (!response.ok) {
                    notifyError(response.message);
                    setIsRelatedItemLoading(true)
                }
                let relatedItem = await response.json();
                relatedItem = relatedItem.filter(item => item.productId !== productId);
                setRelatedProductItem(relatedItem);
                setTimeout(() => {
                    setIsRelatedItemLoading(false)

                }, 1000)
            } catch (error) {
                console.log('Error fetching related-item:', error);
                notifyError(error);
            }
        }
    };

    useEffect(() => {
        const fetchWishlistStatus = async () => {
            if (isAuthenticated) {
                try {
                    const statuses = await Promise.all(
                        relatedProductItem.map(product =>
                            fetch(`http://localhost:5000/users/wishlist/status?userId=${user.userId}&productId=${product.productId}`)
                                .then(response => response.json())
                                .then(data => ({ productId: product.productId, isInWishlist: data.isInWishlist }))
                                .catch(error => ({ productId: product.productId, isInWishlist: false }))
                        )
                    );


                    const statusMap = statuses.reduce((acc, { productId, isInWishlist }) => {
                        acc[productId] = isInWishlist;
                        return acc;
                    }, {});

                    setWishlistStatus(statusMap);

                } catch (error) {
                    notifyError('Error fetching wishlist status!');
                    console.error('Error fetching wishlist status', error);
                }
            } else {
                // setAuthPopup(true);
            }
        };

        fetchWishlistStatus();
    }, [relatedProductItem, isAuthenticated]);

    const toggleWishlist = async (productId) => {

        if (isAuthenticated) {
            const userId = user.userId
            setIsAddingWishList(prev => ({ ...prev, [productId]: true }));
            try {
                const response = await fetch('http://localhost:5000/users/wishlist/add-remove-wishlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId, productId })
                });
                if (response.ok) {

                    fetchWishlist();

                    const result = await response.json();
                    setWishlistStatus(prevState => ({
                        ...prevState,
                        [productId]: !prevState[productId]
                    }));
                    if (result.added) {
                        notifySuccess(result.added);

                    }
                    else {
                        notifyWarning(result.removed);
                    }

                }

            } catch (error) {
                notifyError('Error adding wishlist');
                // console.error('Error adding wishlist', error);
            } finally {
                setIsAddingWishList(prev => ({ ...prev, [productId]: false }));
            }

        }
        else {
            setAuthPopup(true);
        }
    };

    useEffect(() => {
        const currentItemStatus = checkWishList(productItem)
        setWishlist(currentItemStatus);

    }, [productItem, isWishlist, wishlistStatus, wishlist])

    const checkWishList = (productItem) => {
        return wishlist.some(status => status.productId === productItem.productId);
    }
    const handleAuthPopup = (closePopup) => {
        setAuthPopup(closePopup);
    }
    const handlers = useSwipeable({
        onSwipedLeft: () => showNext(),
        onSwipedRight: () => showPrev(),
        preventScrollOnSwipe: true,
        trackMouse: true
    });
    const showNext = () => {
        setImgCurrentIndex((prevIndex) =>
            prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
        );
    };
    const showPrev = () => {
        setImgCurrentIndex((prevIndex) =>
            prevIndex === 0 ? productImages.length - 1 : prevIndex - 1
        );
    };
    const handleProfileImageError = (event) => {
        event.target.src = userIcon;
    }
    const handleDoubleClick = () => {
        setScale(prevScale => (prevScale === 1 ? 2 : 1));
    };
    const openChats = (product) => {
        if (isAuthenticated) {
            navigate('/chat', { state: { product } });
        }
        else {
            setAuthPopup(true);
        }

    }
    const openGoogleMaps = (lat, lon) => {
        const url = `https://www.google.com/maps?q=${lat},${lon}`;
        window.open(url, '_blank');
    };

    function handleShare() {
        if (navigator.share) {
            const currentUrl = window.location.href;
            navigator.share({
                title: productItem.title,
                text: productItem.description,
                url: currentUrl,
            })
                .then(() => console.log('Content shared successfully!'))
                .catch((error) => console.error('Error sharing:', error));
        } else {
            alert('Web Share API is not supported in this browser.');
        }
    }

    useEffect(() => {
        if (productId)
            fetchProductItem(productId);
    }, [productId]);

    return (
        <div className="item-container">
            {isOpenItemLoading ? (
                <div className='item-viewer-container'>
                    <div className=' skeleton-image skeleton-animation'></div>
                    <div className="item-viewer-details-wrapper">
                        <div className="item-viewer-product-price-and-like-wrapper">
                            <div className="skeleton-item-price skeleton-animation"></div>
                            <div className='item-viewer-share-icon'>
                                <div className='skeleton-share-icon skeleton-animation'></div>
                                <div className='skeleton-heart-icon skeleton-animation'></div>
                            </div>
                        </div>
                        <div className="skeleton-item-title skeleton-animation"></div>
                        <div className="item-viewer-product-location-date-wrapper">
                            <div className="skeleton-item-address skeleton-animation"></div>
                            <div className="skeleton-item-date skeleton-animation"></div>
                        </div>
                    </div>
                    <div className="item-viewer-details-wrapper">
                        <div className="skeleton-item-title skeleton-animation"></div>
                        <div className="skeleton-item-address skeleton-animation"></div>
                    </div>
                    <div className="item-viewer-details-wrapper">
                        <div className="skeleton-item-title skeleton-animation"></div>
                        <div className="skeleton-item-address skeleton-animation"></div>
                    </div>

                    <div className="item-viewer-details-wrapper">
                        <div className="skeleton-item-price skeleton-animation"></div>
                        <div className="item-viewer-user-profile-wrapper">
                            <div className="item-viewer-user">
                                <div className="item-viewer-user-profile skeleton-animation"></div>
                                <div className='item-viewer-seller-details' style={{ gap: '10px' }}>
                                    <div className="skeleton-item-price skeleton-animation"></div>
                                    <div className='skeleton-item-title skeleton-animation'></div>
                                </div>
                            </div>
                            <div className='skeleton-item-price skeleton-animation'></div>
                        </div>
                    </div>
                    <div className='mapbox skeleton-animation'></div>

                </div>
            ) : (
                <div className="item-viewer-container">

                    <div className='item-viewer-details-wrapper'>

                        {productItem && productImages.length > 0 && (
                            <div className="item-carousel-container">
                                {productImages.length > 0 && (
                                    <div className="item-viewer-carousel" {...handlers}>
                                        <div className="carousel-image-wrapper">
                                            <img
                                                src={productImages[imgCurrentIndex]}
                                                alt={`Selected ${imgCurrentIndex}`}
                                                className="carousel-image" />
                                        </div>
                                        <button className="prev-button" onClick={showPrev}>
                                            <TfiAngleLeft />
                                        </button>
                                        <button className="next-button" onClick={showNext}>
                                            <TfiAngleRight />
                                        </button>
                                    </div>
                                )}
                                {productImages.length > 0 && (
                                    <div className="circle-indicators">
                                        {productImages.map((_, index) => (
                                            <span
                                                key={index}
                                                className={`circle ${imgCurrentIndex === index ? 'active' : ''}`}
                                            ></span>

                                        ))}
                                        <p className="image-counter">
                                            {imgCurrentIndex + 1} / {productImages.length}
                                        </p>
                                    </div>
                                )}

                            </div>
                        )}



                        {productItem.productStatus.isSold && (<div className='item-sold-error-container'>
                            <span>This product is currently unavailable as it has already been sold out.</span>
                        </div>
                        )}
                        <div className="item-viewer-product-price-and-like-wrapper">
                            <span className="item-viewer-product-price">{productItem.price}</span>
                            <div className='item-viewer-share-icon'>
                                {user.userId !== productItem.userId && <IoChatbubbleOutline size={25} onClick={() => openChats(productItem)} className='i-icon' />}
                                <PiShareFatThin size={25} onClick={handleShare} className='i-icon' />
                                <div
                                    onClick={() => toggleWishlist(productItem.productId)}
                                // disabled={isWishlist}
                                >
                                    {isWishlist ? (
                                        <IoMdHeart color='red' className='item-viewer-product-like-icon' />
                                    ) : (
                                        <IoMdHeartEmpty className='item-viewer-product-like-icon' />
                                    )}
                                </div>

                            </div>
                        </div>
                        <div className="item-viewer-product-title-location-wrapper">
                            <span className="item-viewer-product-title">{productItem.title}</span>
                            <div className="item-viewer-product-location-date-wrapper">
                                <div className="item-viewer-product-location">
                                    <ImLocation2 className="item-viewer-product-location-icon" />
                                    <span>{productItem.address}</span>
                                </div>
                                <span className="item-viewer-product-date">{productItem.date}</span>
                            </div>
                        </div>
                    </div>
                    <div className="item-viewer-details-wrapper">
                        {productItem.brand && (
                            <div>
                                <span className="item-viewer-details-text">Details</span>
                                <div className="item-viewer-brand-wrapper">
                                    <span className="item-viewer-brand">BRAND</span>
                                    <span className="item-viewer-brand-name">{productItem.brand}</span>
                                </div>
                            </div>
                        )}
                        <span className="item-viewer-details-text">Description</span>
                        <div className="item-viewer-brand-wrapper">
                            <span className="item-viewer-dec">{productItem.description}</span>
                        </div>


                        <span className="item-viewer-details-text">Seller details</span>
                        {postedUser && (
                            <div className="item-viewer-user-profile-wrapper">
                                <div className="item-viewer-user">
                                    <img
                                        src={postedUser ? postedUser.profile : userIcon}
                                        alt="user profile"
                                        className="item-viewer-user-profile"
                                        onError={handleProfileImageError}
                                    />
                                    <div className='item-viewer-seller-details'>
                                        <span className="item-viewer-username">{postedUser.name}</span>
                                        <span className='item-vieweer-seller-address'>{productItem.address}</span>

                                    </div>
                                </div>
                                {user.userId !== productItem.userId && <button className='chat-with-seller' onClick={() => openChats(productItem)}>Chat with seller</button>}
                            </div>
                        )}
                    </div>

                    {/* Map */}
                    <div className='item-viewer-details-wrapper'>
                        <div className="item-viewer-map-title-container">
                            <span className="item-viewer-details-text">Posted at</span>
                            <div className='item-viewer-address-btn-wrapper'>
                                <span className="item-viewer-details-address">{productItem.address}</span>
                                <span
                                    className='item-viwer-open-location-in-google-map'
                                    onClick={() => openGoogleMaps(
                                        productItem.location.coordinates[1],
                                        productItem.location.coordinates[0]
                                    )}>View in google map</span>
                            </div>
                        </div>
                        <div className='mapbox'>
                            {productItem.location && productItem.location.coordinates.length > 0 && (
                                <>
                                    {(() => {
                                        const position = [
                                            productItem.location.coordinates[1],
                                            productItem.location.coordinates[0]
                                        ];
                                        return (
                                            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                                                <TileLayer
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                />
                                                <Marker position={position}>
                                                    <Popup>
                                                        {productItem.address}
                                                    </Popup>
                                                </Marker>
                                            </MapContainer>
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isRelatedItemLoading ? (
                <div className='related-item-container'>
                    <div className='skeleton-item-title skeleton-animation'></div>
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className='related-item' style={{ padding: '10px' }}>
                            <div className='related-item-img skeleton-animation' style={{ borderRadius: '10px' }}></div>
                            <div className="skeleton-item-price skeleton-animation"></div>
                            <br></br>
                            <br></br>
                            <div className="skeleton-item-title skeleton-animation"></div>
                            <div className="skeleton-item-address skeleton-animation"></div>

                        </div>
                    ))}

                </div>
            ) : (
                <div className='related-item-container'>
                    <div className='related-item-main-title'><span>Related product near you</span></div>
                    {relatedProductItem.length > 0 ? (
                        <div className='related-item-wrapper'>
                            {relatedProductItem.map((relatedItem, index) => (
                                <div key={index} className='related-item'>
                                    {relatedItem.images.length > 0 && (
                                        <div className='related-item-img-wrapper' onClick={() => fetchProductItem(relatedItem.productId)}>
                                            <img

                                                className='related-item-img'
                                                src={relatedItem.images[0]}
                                                alt={relatedItem.title}
                                                loading='lazy'

                                            />
                                        </div>
                                    )}
                                    <div className='related-item-info' onClick={() => fetchProductItem(relatedItem.productId)}>
                                        <div className='h-price-and-date'>
                                            <span className='h-product-price'>{relatedItem.price}</span>
                                            <span className='h-product-date'>{relatedItem.date}</span>
                                        </div>
                                        <span className='related-item-title'>{relatedItem.title}</span>
                                        <span className='related-item-location'>{relatedItem.description}</span>
                                        <div className='related-item-location-wrapper'>
                                            <CiLocationOn className='related-item-location-icon' />
                                            <span className='related-item-location'>{relatedItem.address}</span>
                                        </div>
                                    </div>
                                    <div
                                        className='related-item-like-icon-wrapper'
                                        onClick={() => toggleWishlist(relatedItem.productId)}
                                        disabled={isAddingWishList[relatedItem.productId]}
                                    >
                                        {isAddingWishList[relatedItem.productId] ? (
                                            <ClipLoader size={12} color='grey' />
                                        ) : wishlistStatus[relatedItem.productId] ? (
                                            <IoMdHeart color='red' className='h-product-like-icon' />
                                        ) : (
                                            <IoMdHeartEmpty className='related-item-like-icon' />
                                        )}
                                    </div>

                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='no-related-product-found'>
                            <NoProductFound className='no-related-product-found-img' />
                            <p>No related products found</p>
                        </div>
                    )}

                </div>
            )}
            {isAuthPopup && (
                <div className='auth-error-wrapper'>
                    <AuthPopup isClosed={handleAuthPopup} />
                </div>

            )}

        </div>
    )
}

export default Item;