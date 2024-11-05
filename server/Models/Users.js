const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
    },
    userId: {
        type:String,
        required:true,
        unique:true
    },
    password: {
        type: String,
    },
    profile: {
        type: String
    },
    blockedUsers: [{ 
        type:String,
        required:true
        }]
    
}, { timestamps: true });

const User = mongoose.model('User', userSchema, 'auth');
module.exports = User;
