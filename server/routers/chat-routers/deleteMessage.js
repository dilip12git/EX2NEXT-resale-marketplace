const express = require('express');
const router = express.Router();
const Chat = require('../../Models/chat'); 

router.delete('/delete-message/:messageId', async (req, res) => {
  const { messageId } = req.params;
  const { senderId } = req.query;

  if (!messageId || !senderId) {
    return res.status(400).json({ message: 'Missing required parameters.' });
  }

  try {
    const result = await Chat.updateOne(
      { 'messages._id': messageId, 'messages.senderId': senderId },
      { $pull: { messages: { _id: messageId, senderId: senderId } } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Message deleted' });
    } else {
      res.status(404).json({ message: 'Message not found or already deleted.' });
    }
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: 'Error deleting message.' });
  }
});

module.exports = router;
