const express = require('express');
const User = require('../Models/Users.js');
const bcrypt = require('bcrypt');
const router = express.Router();
const salt = 10;

const generateRandomString = (length) => {
    const chars = 'abcefghikmnstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomString;
};
router.post('/register', async (req, res) => {
    const { name, email, phoneNumber, password, profile, isGoogleRegister } = req.body;
    console.log(isGoogleRegister)
    const googleId = await bcrypt.hash(password, salt)
    try {
        let newUser = await User.findOne({ email });
        if (newUser) {

            return res.status(400).json({ msg: 'User Already exists !' });
        }
        const randomString = generateRandomString(8);
        const userId = `${name.toLowerCase().replace(/\s/g, '_')}_${randomString}`;

        if (isGoogleRegister) {
            newUser = new User({
                googleId,
                name,
                email,
                phoneNumber,
                userId,
                password: '',
                profile
            });
        }
        else {
            newUser = new User({
                googleId: '',
                name,
                email,
                phoneNumber,
                userId,
                password: googleId,
                profile
            });
        }

        const data = await newUser.save();
        const userData = await User.findById(data._id).select('-password');
        res.status(201).json({ msg: 'success', userData });
    } catch (err) {
        res.status(400).json({ msg: 'Error saving user', error: err });
    }
});

router.post('/updateNumber', async (req, res) => {
    const { email, phoneNumber } = req.body;
    try {
        let newUser = await User.findOne({ email });

        if (newUser) {
            if (newUser.phoneNumber === '') {
                await User.updateOne(
                    { email: newUser.email },
                    { $set: { phoneNumber: phoneNumber } }
                );
                const data = await newUser.save();
                const userData = await User.findById(data._id).select('-password');
                res.status(201).json({ msg: 'success', userData: userData });
            } else {
                res.status(200).json({ msg: 'Phone number is already set' });
            }
        } else {
            res.status(404).json({ msg: 'User not found' });
        }

    } catch (err) {
        res.status(400).json({ msg: 'Error updating user', error: err });
    }
});

module.exports = router;