const express = require('express');
const router = express.Router();
const UserNotification = require('../../Models/notifications'); // adjust path if needed

// Mark notification as read
router.put('/markAsRead/:userId/:notificationId', async (req, res) => {
  const { userId, notificationId } = req.params;

  try {
    // Find the specific user's notifications and update the `isRead` status of the target notification
    const result = await UserNotification.updateOne(
      { currentId: userId, 'notifications._id': notificationId },
      { $set: { 'notifications.$.isRead': true } }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: 'Notification not found or already read.' });
    }

    res.status(200).json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
