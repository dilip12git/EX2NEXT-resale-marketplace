const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Product = require('../Models/product'); 
const router = express.Router();


const BASE_URL = 'http://localhost:5000/files'; 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.body.userId;
    const userFolderPath = path.join(__dirname, '../Users-files/users-post-files', userId);

    if (!fs.existsSync(userFolderPath)) {
      fs.mkdirSync(userFolderPath, { recursive: true });
    }

    cb(null, userFolderPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post('/upload-product', upload.array('images', 10), async (req, res) => {
    const {category, brand, title, description, date, price,userId, location, lat, lon } = req.body;
    
    const images = req.files.map((file) => `${BASE_URL}/${userId}/${file.filename}`);
  
    try {
      const product = new Product({
        category,
        brand,
        title,
        description,
        date,
        price,
        images,
        userId,
        address: location, 
        location: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)] 
        }
    });
  
      await product.save();
  
      res.status(201).json({ message: 'Posted successfully!', product });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading product', error });
      console.log(error);
    }
});

module.exports = router;
