const mongoose = require('mongoose');
const { Schema } = mongoose;

// Notification sub-schema
const NotificationSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
   profile: {
    type: String,
    required: true,
  },
  
  isRead: {
    type: Boolean,
    default: false,
  },
  createDate: {
    type: Date,
    default: Date.now,
  },
});

// Main User Schema for storing notifications for each currentId
const UserNotificationSchema = new Schema({
  currentId: {
    type: String,
    required: true,
    unique: true,
  },
  notifications: [NotificationSchema],
});

const UserNotification = mongoose.model('UserNotification', UserNotificationSchema,'notifications');

module.exports = UserNotification;
