import React, { useState } from 'react';
import './style.css';
import { ReactComponent as LocationSvg } from '../../assets/SVG/locationSvg.svg';
import { CiLocationOn } from "react-icons/ci";
import { TbCurrentLocation } from "react-icons/tb";
import { ClipLoader } from 'react-spinners';

import { useLocation } from '../contexts/LocationContext';
import CryptoService from '../../services/encryptDecryptService.js';

const fetchLocationFromCoordinates = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
        );
        const data = await response.json();
        const location = {
            address: data.display_name,
            countryCode: data.address.country_code,
            city: data.address.suburb,
            longitude: data.lon,
            latitude: data.lat
        }
        return location;
    } catch (error) {
        console.error('Error fetching location from coordinates:', error);
        throw error;
    }
};
function UpdateLocation({ canceled }) {
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const { currentLocation, setCoordinates,
        setCurrentLocation } = useLocation();



    const handleInputChange = async (e) => {
        const inputValue = e.target.value;
        setQuery(inputValue);
        if (inputValue && inputValue.length >= 4) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${inputValue}&format=json&addressdetails=1&limit=5`);
                const data = await response.json();
                setSuggestions(data);
            } catch (error) {
                console.error('Error fetching location suggestions:', error);

            }
        } else {
            setSuggestions([]);
        }
    };


    const handleSuggestionClick = (data) => {
        const storeLocation = {
            address: data.display_name,
            countryCode: data.address.country_code,
            city: data.address.suburb,
            longitude: data.lon,
            latitude: data.lat
        }
        const coor = { lat: data.lat, lon: data.lon };
        // console.log(coor)
        // localStorage.setItem('userLocation', JSON.stringify(storeLocation));
        // localStorage.setItem('userCoordinates', JSON.stringify(coor));
        const encryptedLocation = CryptoService.encryptData(storeLocation);
        localStorage.setItem('userLocation', JSON.stringify(encryptedLocation));

        const decryptCoord = CryptoService.encryptData(coor);
        localStorage.setItem('userCoordinates', JSON.stringify(decryptCoord));

        setCurrentLocation(storeLocation);
        setCoordinates(coor);

        setQuery(data.display_name);
        setSuggestions([]);
        canceled(false);
    };

    const fetchLocation = async () => {
        setIsLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const coord = { lat: latitude, lon: longitude };

                    try {
                        const locationData = await fetchLocationFromCoordinates(latitude, longitude);

                        const encryptedLocation = CryptoService.encryptData(locationData);
                        localStorage.setItem('userLocation', JSON.stringify(encryptedLocation));

                        const decryptCoord = CryptoService.encryptData(coord);
                        localStorage.setItem('userCoordinates', JSON.stringify(decryptCoord));

                        setCurrentLocation(locationData);
                        setCoordinates(coord);

                        setIsLoading(false);
                        canceled(false);
                        

                    } catch (error) {
                        setIsLoading(false);

                    }
                }, (error) => console.error(error),
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            console.logError("Geolocation is not supported by this browser.");
            setIsLoading(false);

        }
    };


    return (
        <div className='update-location-popup'>
            <LocationSvg width={150} height={150} style={{ alignSelf: 'center' }} />
            <div className='uploaction-title'> Your current Location</div>
            <input
                className='update-location-search-input'
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Start typing location..."
            />

            <div className='location-suggestions-dropdwon-wrapper' >
                {suggestions.length > 0 && (
                    <div className='location-suggestions-item-wrapper'>
                        {suggestions.map((location) => (
                            <div
                                key={location.place_id}
                                onClick={() => handleSuggestionClick(location)}
                                className='location-suggestions-item'>
                                <CiLocationOn className='locationIcon' />
                                <span> {location.display_name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className='current-wr' onClick={fetchLocation}>
                <div className='curr-wra'>
                    <TbCurrentLocation className='currentLocation-icon' />
                    <div className='current-location-title'>
                        <span>Use Current Location</span>
                        <span className='current-location-desc'>Click to fetch current location</span>
                    </div>

                </div>
                <div>{isLoading && <ClipLoader color='#0066FF' size={10} />}</div>
            </div>
            <div className='use-current-location-wrapper' onClick={() => canceled(false)}>
                <CiLocationOn className='currentLocation-icon' />
                <div className='current-location-text-wrapper'>
                    <span className='current-location-title'>Saved Location</span>
                    <span className='current-location-desc'>{currentLocation.address}</span>
                </div>
            </div>
            <button className='close-location-popup' onClick={() => canceled(false)}>Cancel</button>
        </div>
    );
};


export default UpdateLocation;