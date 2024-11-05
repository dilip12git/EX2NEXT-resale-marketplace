const express = require('express');
const router = express.Router();
const Product = require('../Models/product'); 
const User = require('../Models/Users');

// Route to get products with location-based filtering and category search
router.get('/products/nearby', async (req, res) => {
    try {
        const { lat, lng, category,distance } = req.query;  // Get latitude, longitude, and category from the request

        // Initialize query object with the isSold condition
        let query = {
            "productStatus.isSold": false  // Ensure only unsold products are fetched
        };

        // Validate lat and lng
        if (lat && lng) {
            const parsedLat = parseFloat(lat);
            const parsedLng = parseFloat(lng);

            if (isNaN(parsedLat) || isNaN(parsedLng)) {
                return res.status(400).json({ message: "Invalid latitude or longitude" });
            }

            // Location-based filtering
            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parsedLng, parsedLat]  // [longitude, latitude]
                    },
                    $maxDistance: distance  // 10 km in meters
                }
            };
        }

        // Category filtering
        if (category) {
            query.category = { $regex: new RegExp(category, 'i') }; 
        }

        // Find products based on the constructed query
        const products = await Product.find(query).sort({ createdAt: -1 });

        // Fetch user details and combine with product data
        const productWithUsers = await Promise.all(products.map(async (product) => {
            const user = await User.findOne({ userId: product.userId });
            return {
                ...product.toObject(),
                user: user ? { name: user.name, email: user.email, profile: user.profile, phoneNumber: user.phoneNumber } : null
            };
        }));

        // Return the combined product and user data
        res.status(200).json(productWithUsers);

    } catch (err) {
        console.error("Error fetching products:", err.message);  // Log the error
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
