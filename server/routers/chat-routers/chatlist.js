const express = require('express');
const router = express.Router();
const UserList = require('../../Models/chatList');
const User = require('../../Models/Users'); 
const Chat = require('../../Models/chat'); 

router.get('/chat-list/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch the user list
    const userList = await UserList.findOne({ userId });
    if (userList && userList.chatPartners.length > 0) {
      // Sort chat partners by timestamp (newest first)
      const chatPartners = userList.chatPartners.sort((a, b) => b.timestamp - a.timestamp);

      // Get user details and unseen message counts for each chat partner
      let totalUnseenCount = 0;
      const userDetailsPromises = chatPartners.map(async (partner) => {
        const userDetail = await User.findOne({ userId: partner.peerId }).select('-password');

        if (userDetail) {
          // Find unseen messages count for this chat partner
          const unseenMessagesCount = await Chat.aggregate([
            { $match: { participants: { $all: [userId, partner.peerId] } } },
            { $unwind: '$messages' },
            { $match: { 'messages.receiverId': userId, 'messages.seen': false } },
            { $count: 'unseenCount' }
          ]);

          const count = unseenMessagesCount.length > 0 ? unseenMessagesCount[0].unseenCount : 0;

          // Accumulate the total unseen count
          totalUnseenCount += count;

          return {
            chatPartner: partner,
            userDetail,
            unseenMessagesCount: count,
          };
        } else {
          return {
            chatPartner: partner,
            userDetail: null,
            unseenMessagesCount: 0,
          };
        }
      });

      const userDetails = await Promise.all(userDetailsPromises);

      // Return both individual user details and the total unseen count
      return res.json({ userDetails, totalUnseenCount });
    }

    // If no chat partners are found
    res.json({ userDetails: [], totalUnseenCount: 0 });
  } catch (error) {
    console.error('Error fetching chat partners:', error);
    res.status(500).json({ error: 'An error occurred while fetching chat partners.' });
  }
});

module.exports = router;
