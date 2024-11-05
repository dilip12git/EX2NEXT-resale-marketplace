const express = require('express');
const router = express.Router();
const User = require('../../Models/Users');
const mongoose = require('mongoose');

router.post('/block-user/:userId', async (req, res) => {
    const { userId } = req.params; 
    const { blockedUserId } = req.body; 

    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const blockedIndex = user.blockedUsers.indexOf(blockedUserId);
        if (blockedIndex !== -1) {
            user.blockedUsers.splice(blockedIndex, 1);
            await user.save();
            return res.status(200).json({ message: 'User unblocked' });
        } else {
            user.blockedUsers.push(blockedUserId);
            await user.save();
            return res.status(200).json({ message: 'User blocked' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error ', error: error.message });
    }
});


router.get('/blocked-users/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findOne({userId});
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ blockedUsers: user.blockedUsers });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blocked users.', error });
    }
});


module.exports = router;