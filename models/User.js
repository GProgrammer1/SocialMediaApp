const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: 'Hey there! I am using Social Media.'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        default: '/uploads/default.jpg'
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FriendRequest'
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    chats : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }],
    isOnline: {
        type: Boolean,
        default: false
    },
    notificationsOn:{ 
        type: Boolean,
        default: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommentText'
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dislike'
    }],
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    accountStatus: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'inactive'
    },
    accountPrivacy: {
        type: String,
        enum: ['Public', 'Private'],
        default: 'Public'
    },
    
    emailToken: {
        type: mongoose.Schema.Types.ObjectId, ref: 'EmailVerificationToken'
        
    },
    resetToken: {
        type: mongoose.Schema.Types.ObjectId, ref: 'ResetToken'
    },
    
}, {timestamps: true});

const User = mongoose.model('User', UserSchema);

module.exports = User;