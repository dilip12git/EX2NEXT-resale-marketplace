// userRouter.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../Models/Users');

const router = express.Router();
const BASE_URL = 'http://localhost:5000/profiles';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../Users-files/users-profiles');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const { userId } = req.body;
    const fileExt = path.extname(file.originalname);
    cb(null, `${userId}_profile${fileExt}`);
  }
});

const upload = multer({ storage: storage });

// Route to update user details
router.put('/update-user', upload.single('profileImage'), async (req, res) => {
  const { name, email, phoneNumber, userId } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ userId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    user.name = name;
    user.email = email;
    user.phoneNumber = phoneNumber;

    // Update profile image if provided
    if (req.file) {
      const oldImagePath = path.join(__dirname, `../post-files/users-profiles/${path.basename(user.profile || '')}`);
      if (user.profile && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Delete old profile image
      }

      // Save the new profile image path
      user.profile = `${BASE_URL}/${req.file.filename}`;
    }

    // Save the updated user details
    await user.save();

    // Exclude the password from the user data in the response
    const { password, ...userDataWithoutPassword } = user.toObject();

    res.json({
      message: 'User updated successfully',
      user: userDataWithoutPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

module.exports = router;
