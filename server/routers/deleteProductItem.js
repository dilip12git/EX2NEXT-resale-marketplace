const express = require('express');
const router = express.Router();
const Product = require('../Models/product'); 

// Route to delete a product by productId
router.delete('/product/delete-product/:productId', async (req, res) => {
    const { productId } = req.params; // Extract productId from the URL parameters

    try {
        // Find and delete the product by productId
        const deletedProduct = await Product.findOneAndDelete({ productId });

        // Check if the product was found and deleted
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

module.exports = router;
