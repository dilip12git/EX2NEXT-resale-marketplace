const express = require('express');
const router = express.Router();
const Product = require('../Models/product');

// Search route
router.get('/search', async (req, res) => {
  const searchQuery = req.query.query;

  if (!searchQuery) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const results = await Product.find({
        $or: [
          { brand: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } },
          { title: { $regex: searchQuery, $options: 'i' } },
          { address: { $regex: searchQuery, $options: 'i' } }
        ]
      });
      

    res.json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ message: 'Server error while searching' });
  }
});

module.exports = router;
