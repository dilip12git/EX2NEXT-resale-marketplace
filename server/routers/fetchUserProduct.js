const express = require('express');
const router = express.Router();
const Product = require('../Models/product'); 

router.get('/user-post', async (req, res) => {
    const { userId } = req.query;
    const query = userId ? { userId: { $regex: new RegExp(userId, 'i') } } : {};
    try {
        const products = await Product.find(query).sort({ createdAt: -1 });
        return res.status(200).json(products);
    } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch products', error: err.message });
    }
});

module.exports = router;
