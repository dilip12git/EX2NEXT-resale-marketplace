const express = require('express');
const router = express.Router();
const Product = require('../Models/product');
const User = require('../Models/Users');

router.get('/product-item/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ productId });

    if (product) {
      const user = await User.findOne({ userId: product.userId });

      if (user) {
        const productWithUserDetails = {
          ...product.toObject(),
          user: {
            name: user.name,
            email: user.email,
            profile:user.profile,
            phoneNumber:user.phoneNumber
          }
        };

        res.status(200).json(productWithUserDetails);
      } else {
        res.status(404).json({ message: 'User not found for this product' });
      }
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
