const express = require('express');
const mongoose = require('mongoose');
const Wishlist = require('../Models/Wishlist'); 
const Product = require('../Models/product'); 

const router = express.Router();

router.get('/user-wishlist/:userId', async (req, res) => {
    try {
      const wishlist = await Wishlist.findOne({ userId: req.params.userId });
  
      if (!wishlist) {
        return res.status(404).json({ message: 'Wishlist not found' });
      }
      const productDetails = await Promise.all(
        wishlist.products.map(async (item) => {
          const product = await Product.findOne({ productId: item.productId });
          return {
            ...item.toObject(), 
            productDetails: product ? product.toObject() : null 
          };
        })
      );
  
      res.status(200).json({
        _id: wishlist._id,
        userId: wishlist.userId,
        products: productDetails,
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

router.delete('/remove-user-wishlist/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { products: { productId } } },
      { new: true }
    );
    
    if (!updatedWishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    const productDetails = await Promise.all(
      updatedWishlist.products.map(async (item) => {
        const product = await Product.findOne({ productId: item.productId });
        return {
          ...item.toObject(), 
          productDetails: product ? product.toObject() : null 
        };
      })
    );

    res.status(200).json({
      _id: updatedWishlist._id,
      userId: updatedWishlist.userId,
      products: productDetails,
      createdAt: updatedWishlist.createdAt,
      updatedAt: updatedWishlist.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
