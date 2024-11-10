const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
        enum: ['public', 'private'],
        default: 'public'
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