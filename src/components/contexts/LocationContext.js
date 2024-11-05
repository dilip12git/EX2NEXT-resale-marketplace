import React, { createContext, useState, useEffect, useContext } from 'react';
import CryptoService from '../../services/encryptDecryptService.js';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [currentLocation, setCurrentLocation] = useState({});
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [coordinates, setCoordinates] = useState({});
  
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
                latitude: data.lat,
            };
            return location;
        } catch (error) {
            throw error;
        }
    };

    const fetchLocation = async () => {
        // if (!currentLocation) {
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

                            const decryptCoord=CryptoService.encryptData(coord);
                            localStorage.setItem('userCoordinates', JSON.stringify(decryptCoord));

                            setCurrentLocation(locationData);
                            setCoordinates(coord);

                            setIsLoading(false);
                            setError(null);

                        } catch (error) {
                            setIsLoading(false);
                            setError('Failed to fetch location details.');
                        }
                    },
                    (err) => {
                        setError(err.message || 'Unable to retrieve location.');
                        setIsLoading(false);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    }
                );
            } else {
                setIsLoading(false);
                setError('Geolocation is not supported by this browser.');
            }
        // }
    };

    const checkPermissionAndFetchLocation = () => {
        setIsLoading(true);
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
                permissionStatus.onchange = () => {
                    if (permissionStatus.state === 'granted') {
                        fetchLocation();
                    } else if (permissionStatus.state === 'denied') {
                        setError('Location permission denied. Please allow access to retry.');
                        setTimeout(() => {
                            setIsLoading(false);
                        }, 1000);
                    }
                };

                if (permissionStatus.state === 'granted') {
                    fetchLocation();
                } else if (permissionStatus.state === 'denied') {
                    setError('Location permission denied. Please allow access to retry.');
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 1000);
                } else {
                    fetchLocation();
                }
            });
        }
    };

    const handleRetry = () => {
        if (!currentLocation) {
            fetchLocation();
        }
    };

    // useEffect(() => {
    //     if (!currentLocation) {
    //         fetchLocation();
    //     }
    // }, []);

    useEffect(() => {
        const location = JSON.parse(localStorage.getItem('userLocation'));
        const userCoord = JSON.parse(localStorage.getItem('userCoordinates'));
        if (location && userCoord) {
            const decryptLocation = CryptoService.decryptData(location);
            setCurrentLocation(decryptLocation);
            const decryptCoord = CryptoService.decryptData(userCoord);
            setCoordinates(decryptCoord);
        }
        else{
            checkPermissionAndFetchLocation()
        }
    }, []);

    return (
        <LocationContext.Provider
            value={{
                currentLocation,
                error,
                isLoading,
                coordinates,
                handleRetry,
                setCoordinates,
                setCurrentLocation,
                fetchLocation
            }}
        >
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    return useContext(LocationContext);
};
