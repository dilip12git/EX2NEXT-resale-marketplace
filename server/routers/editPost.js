const express = require('express');
const router = express.Router();
const Product = require('../Models/product');

router.put('/update-product/:productId', async (req, res) => {
    const { productId } = req.params;
    const { title, brand, category, price, description } = req.body;

    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { productId }, 
            { title, brand, category, price, description }, // Update these fields
            { new: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({message:'updated'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
