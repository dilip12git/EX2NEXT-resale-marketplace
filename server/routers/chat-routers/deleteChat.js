const express = require('express');
const router = express.Router();
const Chat = require('../../Models/chat'); 

router.delete('/delete-chat/:chatId', async (req, res) => {
    try {
        const { userId } = req.body; 
        const chatId = req.params.chatId;
    
        // Find the chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return res.status(404).json({ error: 'Chat not found' });
        }
    
        // Check if the user has already deleted the chat
        const existingEntryIndex = chat.deletionTimestamps.findIndex(
          (entry) => entry.userId === userId
        );
    
        if (existingEntryIndex === -1) {
          // If the user hasn't deleted the chat before, add a new entry
          chat.deletionTimestamps.push({
            userId,
            timestamp: new Date(),
          });
        } else {
          // Update the timestamp if the user had previously deleted it
          chat.deletionTimestamps[existingEntryIndex].timestamp = new Date();
        }
    
        // Save the chat
        await chat.save();
    
        res.status(200).json({ message: 'Chat deleted' });
      } catch (error) {
        console.error('Failed to delete chat:', error);
        res.status(500).json({ error: 'Failed to delete chat' });
      }
    });

  module.exports = router;