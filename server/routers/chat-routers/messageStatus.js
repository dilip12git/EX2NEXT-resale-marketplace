const express = require('express');
const router = express.Router();
const Chat = require('../../Models/chat'); 

// Mark messages as seen
router.put('/mark-seen/:chatId', async (req, res) => {
  const { chatId } = req.params;
  const { currentUserId } = req.body; // ID of the user opening the chat

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Update unseen messages to seen for this user
    chat.messages.forEach((message) => {
      if (message.receiverId === currentUserId && !message.seen) {
        message.seen = true;
      }
    });

    await chat.save();
    res.status(200).json({ message: 'Messages marked as seen' });
  } catch (error) {
    console.error('Error marking messages as seen:', error);
    res.status(500).json({ error: 'An error occurred while marking messages as seen' });
  }
});

module.exports = router;
