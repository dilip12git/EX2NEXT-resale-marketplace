const express = require('express');
const router = express.Router();
const Wishlist = require('../Models/Wishlist');

// Check if a product is in the user's wishlist
router.get('/status', async (req, res) => {
  const { userId, productId } = req.query; // Use query parameters for GET requests

  try {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(200).json({ isInWishlist: false });
    }

    const isInWishlist = wishlist.products.some(product => product.productId === productId);

    return res.status(200).json({ isInWishlist });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error });
  }
});

module.exports = router;
