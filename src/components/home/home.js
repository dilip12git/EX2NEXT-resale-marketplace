import './styles.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHardDrive } from "react-icons/fi";
import { IoCarSportOutline, IoBicycleOutline } from "react-icons/io5";
import { TbAirConditioning, TbSteeringWheel } from "react-icons/tb";
import { LiaMobileSolid, LiaAngleDownSolid } from "react-icons/lia";
import { PiMotorcycleFill, PiDesktopTower, PiWashingMachineThin, PiWashingMachine } from "react-icons/pi";
import { MdOutlineDevicesOther, MdPets, MdOutlineSportsCricket, MdOutlineLiveTv } from "react-icons/md";
import { GiClothes, GiBookshelf, GiRockingChair, GiMusicalNotes, GiPhotoCamera, GiHeadphones, GiCooler, GiManualMeatGrinder } from "react-icons/gi";
import { AiOutlineLaptop } from "react-icons/ai";
import { FaTabletScreenButton } from "react-icons/fa6";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { BiFridge, BiBus } from "react-icons/bi";
import { CiDesktopMouse2, CiClock2, CiSpeaker, CiLocationOn } from "react-icons/ci";
import { BsKeyboard, BsEarbuds, BsSmartwatch } from "react-icons/bs";
import { ClipLoader } from 'react-spinners';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import AuthPopup from '../../auth/authPopup'
import { useWishlist } from '../contexts/WishlistContext';
import { useLocation } from '../contexts/LocationContext';
import { useToast } from '../contexts/ToastService';
import { useAuth } from '../contexts/AuthContext';

function Home() {
    const { fetchWishlist } = useWishlist();
    const [products, setProducts] = useState([]);
    const [filterCategory, setFilterCategory] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const skeletons = Array(10).fill(null);
    const [wishlistStatus, setWishlistStatus] = useState({});
    const [isAddingWishList, setIsAddingWishList] = useState(false);
    const [isAuthPopup, setAuthPopup] = useState(false);
    const navigate = useNavigate();
    const { coordinates } = useLocation();
    const { notifySuccess, notifyError, notifyWarning } = useToast();
    const { isAuthenticated, user } = useAuth();
    const [distance, setDistance]=useState(10000);




    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            if (coordinates.lat && coordinates.lon) {
                try {
                    const response = await fetch(
                        `http://localhost:5000/users/post/products/nearby?lat=${coordinates.lat}&lng=${coordinates.lon}&category=${encodeURIComponent(filterCategory)}&distance=${distance}`
                    );
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    if (data) {
                        setTimeout(() => {
                            setIsLoading(false)
                        }, 1000)
                        setProducts(data);
                    }

                } catch (error) {
                    console.error('Error fetching products:', error);
                }
            }
        };

        fetchProducts();

    }, [filterCategory, coordinates,distance]);



    useEffect(() => {
        const fetchWishlistStatus = async () => {
            if (isAuthenticated) {
                try {
                    const statuses = await Promise.all(
                        products.map(product =>
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
    }, [products, isAuthenticated]);

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
    const handleAuthPopup = (closePopup) => {
        setAuthPopup(closePopup);
    }
    const openItem = (product) => {
        if (product) {
            const pDetails = `${product.category}-${product.title}`
                .replace(/[\s,]+/g, '-');
            const url = `${pDetails}-pid-${product.productId}`;
            navigate(`/item/${url}`);
        }

    }
    return (
        <div className='home'>
            <div className="home-container">
                <div className='categories-wrapper'>
                    <div className={`categories-item ${filterCategory === '' ? 'active' : ''}`} onClick={() => setFilterCategory('')}>
                        <span className='categories-item-title'>All</span>
                    </div>

                    <div className={`categories-item e-category ${filterCategory === 'Electronics' ? 'active' : ''}`}>
                        {/* <MdOutlineDevicesOther className='categories-item-logo' /> */}
                        <span className='categories-item-title'>Electronics</span>
                        <LiaAngleDownSolid className='h-down-angle-icon' />
                        <div className='c-electronic-options-wrapper'>
                            <div className='ec-triangle-ui'></div>

                            <div className={`ce-item ${filterCategory === 'Mobiles' ? 'active' : ''}`} onClick={() => setFilterCategory('Mobiles')}>
                                <LiaMobileSolid className='ce-icon' />
                                <span className='ce-text'>Mobiles</span>
                            </div>

                            <div className={`ce-item ${filterCategory === 'Laptop' ? 'active' : ''}`} onClick={() => setFilterCategory('Laptop')}>
                                <AiOutlineLaptop className='ce-icon' />
                                <span className='ce-text'>Laptop & Desktop</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Hard Disk' ? 'active' : ''}`} onClick={() => setFilterCategory('Hard Disk')}>
                                <FiHardDrive className='ce-icon' />
                                <span className='ce-text'>Hard Disk</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Computer Accessories' ? 'active' : ''}`} onClick={() => setFilterCategory('Computer Accessories')}>
                                <MdOutlineDevicesOther className='ce-icon' />
                                <span className='ce-text'>Computer Accessories</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Monitors' ? 'active' : ''}`} onClick={() => setFilterCategory('Monitors')}>
                                <PiDesktopTower className='ce-icon' />
                                <span className='ce-text'>Monitors</span>
                            </div>
                            <div className={`ce-item ${filterCategory === '#0066FFtooth Headphones' ? 'active' : ''}`} onClick={() => setFilterCategory('Bluetooth Headphones')}>
                                <GiHeadphones className='ce-icon' />
                                <span className='ce-text'>Bluetooth Headphones</span>
                            </div>
                            <div
                                className={`ce-item ${filterCategory === 'Earbuds' ? 'active' : ''}`}
                                onClick={() => setFilterCategory('Earbuds')}>
                                <BsEarbuds className='ce-icon' />
                                <span className='ce-text'>Earbuds</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Tablets' ? 'active' : ''}`} onClick={() => setFilterCategory('Tablets')}>
                                <FaTabletScreenButton className='ce-icon' />
                                <span className='ce-text'>Tablets</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Mouse' ? 'active' : ''}`} onClick={() => setFilterCategory('Mouse')}>
                                <CiDesktopMouse2 className='ce-icon' />
                                <span className='ce-text'>Mouse</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Keyboard' ? 'active' : ''}`} onClick={() => setFilterCategory('Keybord')}>
                                <BsKeyboard className='ce-icon' />
                                <span className='ce-text'>Keyboard</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Camera and Lenses' ? 'active' : ''}`} onClick={() => setFilterCategory('Camera')}>
                                <GiPhotoCamera className='ce-icon' />
                                <span className='ce-text'>Camera and Lenses</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Smart Watch' ? 'active' : ''}`} onClick={() => setFilterCategory('SmartWatch')}>
                                <BsSmartwatch className='ce-icon' />
                                <span className='ce-text'>Smart Watch</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Speaker' ? 'active' : ''}`} onClick={() => setFilterCategory('Speaker')}>
                                <CiSpeaker className='ce-icon' />
                                <span className='ce-text'>Speaker</span>
                            </div>

                        </div>
                    </div>

                    <div className={`categories-item hp-category  ${filterCategory === 'Home Appliances' ? 'active' : ''}`}  >
                        {/* <PiWashingMachineThin className='categories-item-logo' /> */}
                        <span className='categories-item-title'>Home Appliances</span>
                        <LiaAngleDownSolid className='h-down-angle-icon' />
                        <div className='c-home-appliances-options-wrapper'>
                            <div className='ec-triangle-ui'></div>
                            <div className={`ce-item ${filterCategory === 'ACs' ? 'active' : ''}`} onClick={() => setFilterCategory('Ac')}>
                                <TbAirConditioning className='ce-icon' />
                                <span className='ce-text'>ACs</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Televison' ? 'active' : ''}`} onClick={() => setFilterCategory('Televison')}>
                                <MdOutlineLiveTv className='ce-icon' />
                                <span className='ce-text'>Televison</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Washing Machine' ? 'active' : ''}`} onClick={() => setFilterCategory('Washingmachine')}>
                                <PiWashingMachine className='ce-icon' />
                                <span className='ce-text'>Washing Machine</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Cooler' ? 'active' : ''}`} onClick={() => setFilterCategory('Cooler')}>
                                <GiCooler className='ce-icon' />
                                <span className='ce-text'>Cooler</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Fridges' ? 'active' : ''}`} onClick={() => setFilterCategory('Fridges')}>
                                <BiFridge className='ce-icon' />
                                <span className='ce-text'>Fridges</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Mixer Grinder' ? 'active' : ''}`} onClick={() => setFilterCategory('MixerGrinder')}>
                                <GiManualMeatGrinder className='ce-icon' />
                                <span className='ce-text'>Mixer Grinder</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Pets' ? 'active' : ''}`} onClick={() => setFilterCategory('Pets')}>
                                <MdPets className='ce-icon' />
                                <span className='ce-text'>Pets</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Clock' ? 'active' : ''}`} onClick={() => setFilterCategory('Clock')}>
                                <CiClock2 className='ce-icon' />
                                <span className='ce-text'>Clock</span>
                            </div>
                            <div className={`ce-item  ${filterCategory === 'Furnitures' ? 'active' : ''}`} onClick={() => setFilterCategory('Furnitures')}>
                                <GiRockingChair className='ce-icon' />
                                <span className='ce-text'>Furnitures</span>
                            </div>

                        </div>
                    </div>


                    <div className='categories-item v-catrgory' >
                        {/* <TbSteeringWheel className='categories-item-logo' /> */}
                        <span className='categories-item-title'>Vehicles</span>
                        <LiaAngleDownSolid className='h-down-angle-icon' />
                        <div className='c-vehicles-options-wrapper'>
                            <div className='ec-triangle-ui'></div>
                            <div className={`ce-item ${filterCategory === 'Cars' ? 'active' : ''}`} onClick={() => setFilterCategory('Cars')}>
                                <IoCarSportOutline className='ce-icon' />
                                <span className='ce-text'>Cars</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'MotorCycle' ? 'active' : ''}`} onClick={() => setFilterCategory('MotorCycle')}>
                                <PiMotorcycleFill className='ce-icon' />
                                <span className='ce-text'>MotorCycle</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Bicycle' ? 'active' : ''}`} onClick={() => setFilterCategory('Bicycle')} >
                                <IoBicycleOutline className='ce-icon' />
                                <span className='ce-text'>Bicycle</span>
                            </div>
                            <div className={`ce-item ${filterCategory === 'Other 4 Wheeler' ? 'active' : ''}`} onClick={() => setFilterCategory('wheeler')}>
                                <BiBus className='ce-icon' />
                                <span className='ce-text'>Other 4 Wheeler</span>
                            </div>

                        </div>

                    </div>
                </div>

                {isLoading ? (
                    <div className='home skeleton-home'>
                        {/* <div className='h-fTitle skeleton-title skeleton-animation'></div> */}
                        <div className='home-all-post-wrapper'>
                            {skeletons.map((_, index) => (
                                <div key={index} className='h-product-item skeleton-item '>
                                    <div className='h-product-img-wrapper skeleton-animation'>

                                    </div>
                                    <div className='h-product-info-wrapper skeleton-info-wrapper'>
                                        <span className='h-product-price skeleton-price skeleton-animation'></span>
                                        <span className='h-product-title skeleton-product-title skeleton-animation'></span>
                                        <span className='h-product-location skeleton-product-address skeleton-animation'></span>
                                    </div>

                                </div>

                            ))}

                        </div>
                    </div>
                ) : (
                    <div>
                        <div className='h-title-container'>
                            <div><span style={{color:'grey'}}>Recent post</span></div>
                            <div className='distance-container'>
                                <div className='distance'><span>Area - {distance/1000} km</span></div>
                                <div className='distance-option'>
                                    <span className='distance-item' onClick={()=>setDistance(5000)}>Area 5 km</span>
                                    <span className='distance-item' onClick={()=>setDistance(10000)}>Area 10 km</span>
                                    <span className='distance-item' onClick={()=>setDistance(20000)}>Area 20 km</span>
                                    <span className='distance-item' onClick={()=>setDistance(50000)}>Area 50 km</span>
                                    <span className='distance-item' onClick={()=>setDistance(80000)}>Area 80 km</span>
                                    <span className='distance-item' onClick={()=>setDistance(100000)}>Area 100 km</span>
                                </div>
                            </div>
                        </div>
                        <div className='home-all-post-wrapper'>
                            {products.map(product => (
                                <div key={product._id} className='h-product-item'>
                                    {product.images.length > 0 && (
                                        <div className='h-product-img-wrapper'  onClick={() => openItem(product)}>
                                            <img
                                                className='h-product-img'
                                                src={product.images[0]}
                                                alt={product.title}
                                                loading='lazy'
                                            />
                                        </div>
                                    )}
                                    <div className='h-product-info-wrapper'  onClick={() => openItem(product)}>
                                       <div className='h-price-and-date'>
                                        <span className='h-product-price'>{product.price}</span>
                                        <span className='h-product-date'>{product.date}</span>
                                        </div>
                                        <span className='h-product-title'>{product.title}</span>
                                        <span className='related-item-location'>{product.description}</span>
                                        <div className='h-product-location-wrapper'>
                                            <CiLocationOn className='h-product-location-icon' />
                                            <span className='h-product-location'>{product.address}</span>
                                        </div>
                                    </div>
                                    <div
                                        className='h-product-like-icon-wrapper'
                                        onClick={() => toggleWishlist(product.productId)}
                                        disabled={isAddingWishList[product.productId]}
                                    >
                                        {isAddingWishList[product.productId] ? (
                                            <ClipLoader size={12} color='grey' />
                                        ) : wishlistStatus[product.productId] ? (
                                            <IoMdHeart color='red' className='h-product-like-icon' />
                                        ) : (
                                            <IoMdHeartEmpty className='h-product-like-icon' />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


            </div>
            {isAuthPopup && (
                <div className='auth-error-wrapper'>
                    <AuthPopup isClosed={handleAuthPopup} />
                </div>

            )}

        </div >
    );
}
export default Home;