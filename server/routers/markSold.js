const express = require('express');
const router = express.Router();
const Product = require('../Models/product');

// Route to update the productStatus by productId
router.put('/products/update-status/:productId', async (req, res) => {
    const { productId } = req.params;   // Get productId from the URL
    const { isSold } = req.body;        // Get the updated isSold status from request body

    try {
        // Find the product by productId and update its productStatus.isSold field
        const updatedProduct = await Product.findOneAndUpdate(
            { productId },              // Filter by productId
            { $set: { 'productStatus.isSold': isSold } },  // Update the isSold field
            { new: true }               // Return the updated document
        );

        // If no product is found, return 404
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Return the updated product
        res.status(200).json({msg:'Updated'});

    } catch (err) {
        console.error('Error updating product status:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
