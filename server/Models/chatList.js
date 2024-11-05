const mongoose = require('mongoose');

const chatListSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  chatPartners: [{
    peerId: { type: String, required: true }, 
    lastMessage: { type: String }, 
    timestamp: { type: Date, default: Date.now }, 
  }],
}, { timestamps: true });

module.exports = mongoose.model('ChatList', chatListSchema, 'chatlists');
