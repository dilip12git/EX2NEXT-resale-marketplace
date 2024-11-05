import './styles.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHardDrive } from "react-icons/fi";
import { IoCarSportOutline, IoBicycleOutline } from "react-icons/io5";
import { TbBuildingSkyscraper, TbAirConditioning } from "react-icons/tb";
import { LiaMobileSolid } from "react-icons/lia";
import { PiMotorcycleFill, PiDesktopTower, PiWashingMachineThin } from "react-icons/pi";
import { MdOutlineDevicesOther, MdPets, MdOutlineSportsCricket, MdOutlineLiveTv, MdOutlineCloudUpload, MdOutlineEditLocation } from "react-icons/md";
import { GiGears, GiClothes, GiBookshelf, GiRockingChair, GiMusicalNotes, GiPhotoCamera,GiHeadphones,GiManualMeatGrinder } from "react-icons/gi";
import { AiOutlineLaptop } from "react-icons/ai";
import { FaTabletScreenButton } from "react-icons/fa6";
import { IoIosFitness, IoMdHeartEmpty } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { BiFridge,BiBus } from "react-icons/bi";
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';
import { BsKeyboard, BsEarbuds, BsSmartwatch } from "react-icons/bs";
import { CiClock2, CiSpeaker ,CiDesktopMouse2} from "react-icons/ci";
import CurrencyInput from 'react-currency-input-field';
import PhoneInput from 'react-phone-input-2';
import { getParamByISO } from 'iso-country-currency';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { useSwipeable } from 'react-swipeable';
import { TfiAngleRight, TfiAngleLeft } from "react-icons/tfi";
import { ImLocation2 } from "react-icons/im";
import UpdateLocation from '../UpdateLocation/UpdateLocation'
import { useLocation } from '../contexts/LocationContext';
import { useToast } from '../contexts/ToastService';
import { useAuth } from '../contexts/AuthContext';
import CryptoService from '../../services/encryptDecryptService';

function ProductDetails() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stepIndex, setStepIndex] = useState(0);
    const titleCharLimit = 80;
    const descCharLimit = 1000;
    const [titleCharCount, setTitleCharCount] = useState(0);
    const [descCharCount, setDescCharCount] = useState(0);
    const navigate = useNavigate();
    const [imgCurrentIndex, setImgCurrentIndex] = useState(0);
    const [isUserPhone, setUserPhone] = useState(false);
    const [currencySymbol, setCurrencySymbol] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTitle, setSelectedTitle] = useState('');
    const [brand, setBrand] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [proPrice, setProPrice] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [selectedImgFiles, setSelectedImgFiles] = useState([]);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const {currentLocation,coordinates } = useLocation();
    const { notifySuccess, notifyError } = useToast();
    const position = [coordinates.lat, coordinates.lon];
    const [isUpdateLocation, setIsUpdateLocation] = useState(false);
    const {isAuthenticated, user}=useAuth();

    useEffect(() => {
        const handlePopState = (e) => {
            e.preventDefault();
            if (stepIndex >= 1) {
                if (window.confirm("Do you want to go back without submitting details?")) {
                    navigate('/');
                } else {
                    window.history.pushState(null, null, window.location.pathname);
                }
            } else {
                navigate('/');
            }
        };
        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [stepIndex, navigate]);


    useEffect(() => {
        if (isAuthenticated) {
            setCurrencySymbol(getParamByISO(currentLocation.countryCode, 'symbol'));
        }
        if (user) {
            if (user.phoneNumber === "") {
                setUserPhone(true)
            }
        }
        else {
            navigate('/')
        }
    },[isAuthenticated,user])
  
    const getCurrentDate = () => {
        const today = new Date();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        const day = today.getDate();
        const month = months[today.getMonth()];
        const year = today.getFullYear();
        return `${day} ${month} ${year}`;
    };
    useEffect(() => {
        setCurrentDate(getCurrentDate());
    }, []);

    const handleNext = () => {
        if (stepIndex === 0) {
            if (!selectedTitle) {
                notifyError('Please select a product category!');
            } else {
                setStepIndex(1);
                if (currentIndex < productDetailsItem.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                }
            }
        }
        else if (stepIndex === 1) {
            if (!title || !description) {
                notifyError('Please fill in all the details!');
            } else {
                setStepIndex(2);

                if (currentIndex < productDetailsItem.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                }
            }
        }
        else if (stepIndex === 2) {
            if (selectedImages.length < 2) {
                notifyError('Please select at least 2 picture!');
            } else {
                setStepIndex(3);
                if (currentIndex < productDetailsItem.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                }
            }
        }
        else if (stepIndex === 3) {
            if (!proPrice) {
                notifyError('Please set price !');
            } else {
                setStepIndex(4);
                setIsUpdateLocation(true);
                if (currentIndex < productDetailsItem.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                }

            }
        }
        else if (stepIndex === 4) {
            uploadProductData();
        }

    };
    const handleCanceledPopup = (isCancled) => {
        setIsUpdateLocation(isCancled);

    }

    const uploadProductData = async () => {
        setIsLoading(true);
        const price = currencySymbol + ' ' + proPrice;
        const formData = new FormData();
        formData.append('category', selectedTitle);
        formData.append('brand', brand);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('date', currentDate);
        formData.append('price', price);
        formData.append('userId', user.userId);
        formData.append('location', currentLocation.address);
        formData.append('lat', coordinates.lat);
        formData.append('lon', coordinates.lon);

        selectedImgFiles.forEach((file) => {
            formData.append('images', file);
        });
        try {
            const response = await fetch('http://localhost:5000/users/post/upload-product', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setIsLoading(false);
                const result = await response.json();
                notifySuccess(result.message);
                setTimeout(() => {
                    navigate('/');
                }, 1000)
            } else {
                notifyError('Failed to upload product');
                setIsLoading(false);

            }
        } catch (error) {
            notifyError(error)
            setIsLoading(false);

        }
    };
    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            if (stepIndex !== 0) {
                setStepIndex(stepIndex - 1);
            }
        }
    };

    const spcItems = [
        { logo: <IoCarSportOutline />, title: 'Cars' },
        { logo: <TbBuildingSkyscraper />, title: 'Properties' },
        { logo: <LiaMobileSolid />, title: 'Mobiles' },
        { logo: <FaTabletScreenButton />, title: 'Tablets' },
        { logo: <PiMotorcycleFill />, title: 'Motorcycles' },
        { logo: <IoBicycleOutline />, title: 'Bicycles' },
        { logo: <MdOutlineDevicesOther />, title: 'E-Appliances' },
        { logo: <GiGears />, title: 'Vehicles Parts' },
        { logo: <GiBookshelf />, title: 'Books' },
        { logo: <GiRockingChair />, title: 'Furnitures' },
        { logo: <AiOutlineLaptop />, title: 'Laptops' },
        { logo: <PiDesktopTower />, title: 'Desktops' },
        { logo: <GiPhotoCamera />, title: 'Camera & Lenses' },
        { logo: <FiHardDrive />, title: 'Drives' },
        { logo: <GiClothes />, title: 'Fashion' },
        { logo: <MdPets />, title: 'Pets' },
        { logo: <GiMusicalNotes />, title: 'Musical Instruments' },
        { logo: <MdOutlineSportsCricket />, title: 'Sports Equipment' },
        { logo: <IoIosFitness />, title: 'Gym & Fitness' },
        { logo: <BiFridge />, title: 'Fridges' },
        { logo: <TbAirConditioning />, title: 'ACs' },
        { logo: <MdOutlineLiveTv />, title: 'Television' },
        { logo: <PiWashingMachineThin />, title: 'Washing Machines' },
        { logo: <GiHeadphones />, title: '#0066FFtooth Headphones' },
        { logo: <BsEarbuds />, title: 'Earbuds' },
        { logo: <CiDesktopMouse2 />, title: 'Mouse' },
        { logo: <BsKeyboard />, title: 'Keyboard' },
        { logo: <BsSmartwatch />, title: 'Smart Watch' },
        { logo: <CiSpeaker />, title: 'Speaker' },
        { logo: <GiManualMeatGrinder />, title: 'Mixer Grinder' },
        { logo: <CiClock2 />, title: 'Clock' },
        { logo: <BiBus />, title: 'Other 4 Wheeler' },
    ];
    const handleItemClick = (title) => {
        setSelectedTitle(title);
    };
    const handleBrandChange = (e) => setBrand(e.target.value);
    const handleTitleChange = (e) => {
        const value = e.target.value;
        if (value.length <= titleCharLimit) {
            setTitle(value);
            setTitleCharCount(value.length);
        }
    };
    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        if (value.length <= descCharLimit) {
            setDescription(value);
            setDescCharCount(value.length);
        }
    };
    const handleImageSelection = (event) => {
        const files = Array.from(event.target.files);
        if (files.length + selectedImages.length > 4) {
            notifyError("You can only select up to 4 images.")
            return;
        }
        const imagesArray = files.map((file) => URL.createObjectURL(file));
        setSelectedImages((prevImages) => prevImages.concat(imagesArray));
        setSelectedImgFiles((prevFiles) => prevFiles.concat(files));
    };
    const removeImage = (index) => {
        setSelectedImages((prevImages) =>
            prevImages.filter((_, i) => i !== index)
        );
        setSelectedImgFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };
    const updateUserPhoneNumber = async () => {
        if (!phoneNumber) {
            notifyError("Phone number required");
        } else if (phoneNumber.length < 10) {
            notifyError('Phone number must be 10 digits');
        }
        else {
            try {
                let email = user.email;
                const response = await fetch('http://localhost:5000/users/auth/updateNumber', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, phoneNumber }),
                });

                const data = await response.json();
                if (response.ok) {
                    if (data.msg === 'success') {
                        const encryptedUserData=CryptoService.encryptData(data.userData);
                        localStorage.setItem('userData', JSON.stringify(encryptedUserData));
                        notifySuccess('Updated successfully');
                        setUserPhone(false);
                    }
                } else {
                    notifyError(`Error: ${data.msg}`);
                }
            } catch (error) {
                console.error('Error:', error);
                notifyError('An error occurred while updating the number.');
            }
        }
    };
    const handlers = useSwipeable({
        onSwipedLeft: () => showNext(),
        onSwipedRight: () => showPrev(),
        preventScrollOnSwipe: true,
        trackMouse: true
    });
    const showNext = () => {
        setImgCurrentIndex((prevIndex) =>
            prevIndex === selectedImages.length - 1 ? 0 : prevIndex + 1
        );
    };
    const showPrev = () => {
        setImgCurrentIndex((prevIndex) =>
            prevIndex === 0 ? selectedImages.length - 1 : prevIndex - 1
        );
    };
    const productDetailsItem = [
        <div className="product-wrapper sp-category-wrapper">
            <div className=' sp-title-container spc-title-container'>
                <span className='sp-title spc-title'>
                    What are you offering?
                </span>
            </div>
            <div className='sp-title-desc'>
                Select the most accurate product category to ensure better visibility, easier searchability, and relevance for potential buyers.
            </div>

            <div className='spc-item-wrapper'>
                {spcItems.map((item, index) => (
                    <div
                        key={index}
                        className='spc-item'
                        onClick={() => handleItemClick(item.title)}
                        style={{
                            border: selectedTitle === item.title ? '1px solid #0066FF' : '1px solid #ddd',
                            cursor: 'pointer',
                        }}
                    >
                        <div className='spc-item-logo'>{item.logo}</div>
                        <div className='spc-check-mark-icon-container'>
                            {selectedTitle === item.title && (
                                <FaCheckCircle className="spc-item-checkMark-icon" />
                            )}
                        </div>
                        <span className='spc-item-title'>{item.title}</span>

                    </div>
                ))}
            </div>
        </div>,
        <div className="product-wrapper">
            <div className='sp-title-container'>
                <span className='sp-title'>Include some details</span>
            </div>
            <div className='sp-title-desc'>Provide clear details about the used product, including brand, model, condition, usage history, features, and any wear or defects.</div>
            <form className='sp-details-wrapper'>
                <div className='sp-input-wrapper'>
                    <label className='sp-brand-label'>Brand (Optional)</label>
                    <input
                        type='text'
                        className='sp-input-box'
                        placeholder='for eg, Apple'
                        value={brand}
                        onChange={handleBrandChange}
                    />
                </div>
                <div className='sp-input-wrapper'>
                    <label className='sp-brand-label'>Product title</label>
                    <input
                        type='text'
                        className='sp-input-box'
                        placeholder='for eg, iPhone 12 Pro Max'
                        value={title}
                        onChange={handleTitleChange}

                    />
                    <div className='sp-maxText-allow'>
                        {titleCharCount}/{titleCharLimit}
                    </div>
                </div>
                <div className='sp-input-wrapper'>
                    <label className='sp-brand-label'>Describe what you are selling</label>
                    <textarea
                        className='sp-input-box sp-textarea'
                        rows={8}
                        value={description}
                        onChange={handleDescriptionChange}
                        placeholder='Describe here...'

                    />
                    <div className='sp-maxText-allow'>
                        {descCharCount}/{descCharLimit}
                    </div>
                </div>

            </form>
        </div>,
        <div className="product-wrapper">
            <div className='sp-title-container'>
                <span className='sp-title'>Upload pictures</span>
            </div>
            <div className='sp-title-desc'>Upload high-quality pictures of the used product from different angles, highlighting key features, condition, and any noticeable wear.</div>
            <div className="image-chooser-container">
                <label className="custom-file-upload">
                    <input
                        id="file-input"
                        type="file"
                        multiple
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageSelection}

                    />
                    <MdOutlineCloudUpload className='cloud-icon' />
                    <span className='choose-image-text'>You can select  up to 4 images</span>
                </label>
            </div>
            <div className="image-preview-container">
                {selectedImages.map((image, index) => (
                    <div key={index} className="image-preview">
                        <img
                            src={image}
                            alt={`Selected ${index}`}
                            className="preview-image"
                        />
                        <button
                            onClick={() => removeImage(index)}
                            className="remove-image-button"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>

        </div>,
        <div className="product-wrapper">
            <div className='sp-title-container'>
                <span className='sp-title'>Set a price</span>
            </div>
            <div className='sp-title-desc'>Set a competitive price for the used product, considering its condition, market value, and current demand for second-hand items.</div>
            <div className='sp-input-wrapper'>
                <label className='sp-brand-label'>Price</label>
                <CurrencyInput
                    className="sp-input-box"
                    name="currency"
                    placeholder="set product price"
                    defaultValue={proPrice}
                    decimalsLimit={2}
                    onValueChange={(proPrice) => setProPrice(proPrice)}
                    prefix={currencySymbol}
                />
            </div>
        </div>,

        <div className="product-wrapper">
            <div className="preview-container">
                <div className='sp-title-container'>
                    <span className='sp-title'>Preview</span>
                </div>
                <div className='sp-title-desc'>
                    Review all details thoroughly in the preview, ensuring accuracy in the description, price, pictures, and category before final submission.
                </div>
                <div className="carousel-container">
                    {selectedImages.length > 0 && (
                        <div className="carousel" {...handlers}>
                            <div className="carousel-image-wrapper">
                                <img
                                    src={selectedImages[imgCurrentIndex]}
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
                    {selectedImages.length > 0 && (
                        <div className="circle-indicators">
                            {selectedImages.map((_, index) => (
                                <span
                                    key={index}
                                    className={`circle ${imgCurrentIndex === index ? 'active' : ''}`}
                                ></span>

                            ))}
                            <p className="image-counter">
                                {imgCurrentIndex + 1} / {selectedImages.length}
                            </p>
                        </div>
                    )}

                </div>
                <div className="pre-details-wrapper">
                    <div className='pre-product-price-and-like-wrapper'>
                        <span className='pre-product-price'>Rs. {proPrice}</span>
                        <IoMdHeartEmpty className='pre-product-like-icon' />
                    </div>
                    <div className='pre-product-title-location-wrapper'>
                        <span className='pre-product-title'>{title}</span>
                        <div className='pre-product-location-date-wrapper'>
                            <div className='pre-product-location'>
                                <ImLocation2 className='pre-product-location-icon' />
                                <span className='pre-product-location'>{currentLocation.address}</span>
                            </div>
                            <span className='pre-product-date'>{currentDate}</span>
                        </div>
                    </div>
                </div>
                <div className="pre-details-wrapper">
                    <span className='pre-details-text'>Details</span>
                    <div className='pre-brand-wrapper'>
                        <span className='pre-brand'>BRAND</span>
                        <span className='pre-brand-name'>{brand}</span>
                    </div>
                </div>
                <div className="pre-details-wrapper">
                    <span className='pre-details-text'>Description</span>
                    <div className='pre-brand-wrapper'>
                        <span className='pre-dec'>{description}</span>
                    </div>
                </div>
                <div className="pre-details-wrapper">
                    <div className='pre-user-profile-wrapper'>
                        <div className='pre-user'>
                            <img src={userData.profile} alt='user profile' className='pre-user-profile' />
                            <span className='pre-username'>{userData.name}</span>
                        </div>
                        <TfiAngleRight />
                    </div>
                </div>
                <div className='pre-map-title-container'>
                    <span className='pre-details-text'>Posted at</span>
                    <div className='pre-open-update-location' onClick={() => setIsUpdateLocation(true)}>
                        <MdOutlineEditLocation />
                        <span>Change your current location</span>
                    </div>
                </div>
                <div className='mapbox'>
                    <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>

                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />

                        <Marker position={position}>
                            <Popup>
                                Location at latitude: {coordinates.lat}, longitude: {coordinates.lon}.
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
            </div>

        </div >,
    ];

    return (
        <div className="s-p-container">
            <div className="sp-wrapper">

                {productDetailsItem[currentIndex]}

            </div>
         
            <div className="sp-next-button-container">
                {currentIndex > 0 &&
                    <button className='sp-prev-btn sp-btn' onClick={handlePrev}>
                        Edit previous details
                    </button>}
                <button
                    className='sp-next-btn sp-btn'
                    onClick={handleNext}
                >
                    {currentIndex === 4 ? (
                        <div>Post</div>
                    ) : (
                        <div>Next</div>
                    )}
                </button>

            </div>
            {isLoading && (
                <div className='loading-animation-container'>
                    <div className='loading-animation'>
                        <ClipLoader
                            color="#0066FF"
                            loading
                            size={19}
                        />
                        <span>Uploading...</span>
                    </div>
                </div>
            )}

            {isUserPhone && (
                <div className='phone_number_ppContainer'>
                    <div className='phone-number-wrapper'>
                        <div className='sp-title-container'>
                            <span className='sp-title'>Add phone number</span>
                        </div>
                        <div className='sp-input-wrapper'>
                            <label className='sp-brand-label'>Phone number</label>
                            <PhoneInput
                                country={currentLocation.countryCode}
                                value={phoneNumber}
                                onChange={(phone) => setPhoneNumber(`+${phone}`)}
                                containerStyle={{
                                    borderRadius: '10px',
                                    border: '1px solid #ddd',
                                    width: '100%',
                                    padding: '3px 0px'
                                }}
                                containerClass='pinput'
                                buttonStyle={{
                                    border: 'none',
                                    borderRadius: '10px',
                                    background: 'transparent',
                                }}
                                inputStyle={{
                                    border: 'none',
                                    width: '100%'
                                }} />
                        </div>
                        <button className='update-phoneBtn' onClick={updateUserPhoneNumber}>Submit</button>
                    </div>
                </div>

            )}

            {isUpdateLocation && (
                <div className='p-update-location-wrapper'>
                    <UpdateLocation canceled={handleCanceledPopup} />
                </div>

            )}

        </div>
    )
}
export default ProductDetails;