const express = require('express');
const router = express.Router();
const Product = require('../Models/product'); 

router.get('/related-product-items/nearby?', async (req, res) => {
    const { lat, lng, category } = req.query; 


    let query = {};

    if (lat && lng) {
        query.location = {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(lng), parseFloat(lat)] 
                },
                $maxDistance: 10000 
            }
        };
    }

    if (category) {
        query.category = { $regex: new RegExp(category, 'i') }; 
    }
  
    try {
      
        const relatedProductItems = await Product.find(query).sort({ createdAt: -1 });
        res.status(200).json(relatedProductItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
