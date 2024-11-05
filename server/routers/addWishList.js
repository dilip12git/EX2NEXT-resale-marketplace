const express = require('express');
const router = express.Router();
const Wishlist = require('../Models/Wishlist');


router.post('/add-remove-wishlist', async (req, res) => {
    const { userId, productId } = req.body;
  
    try {
      let wishlist = await Wishlist.findOne({ userId });
  
      if (!wishlist) {
        wishlist = new Wishlist({
          userId,
          products: [{ productId }]
        });
        await wishlist.save();
        return res.status(200).json({ added: 'Product added to wishlist', wishlist });
      }
      const productIndex = wishlist.products.findIndex((item) => item.productId === productId);
  
      if (productIndex > -1) {
        wishlist.products.splice(productIndex, 1);
        await wishlist.save();
        return res.status(200).json({ removed: 'Product removed from wishlist', wishlist });
      } else {
        wishlist.products.push({ productId });
        await wishlist.save();
        return res.status(200).json({ added: 'Product added to wishlist', wishlist });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Server error', details: error });
    }
  });
  
  // Export the router
  module.exports = router;
