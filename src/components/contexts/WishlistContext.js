// WishlistContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastService';
import { useAuth } from './AuthContext';
const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated, user } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const { notifySuccess, notifyError, notifyWarning } = useToast();
    const [wishlistCount, setWishlistCount] = useState(0);

 

    const fetchWishlist = async () => {
        if (isAuthenticated) {
            try {
                const response = await fetch(`http://localhost:5000/users/wishlist/user-wishlist/${user.userId}`);
                if (!response.ok) {
                    setIsLoading(false);
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setWishlist(data.products || []);
                setWishlistCount(data.products.length || 0);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching wishlist:', error);
                setIsLoading(false);
            }
        }
    };
    useEffect(() => {
        fetchWishlist();
    }, [user.userId]);

    const handleRemove = async (productId) => {
        try {
            const response = await fetch(`http://localhost:5000/users/wishlist/remove-user-wishlist/${user.userId}/${productId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to remove product');
            }
            notifyWarning('Removed from wishlist');
            const updatedWishlist = await response.json();
            setWishlist(updatedWishlist.products);
            setWishlistCount(updatedWishlist.products.length || 0);
        } catch (error) {
            console.error('Error removing product from wishlist:', error);
        }
    };

    return (
        <WishlistContext.Provider
            value={{
                isLoading,
                wishlist,
                handleRemove,
                fetchWishlist,
                wishlistCount
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    return useContext(WishlistContext);
};
