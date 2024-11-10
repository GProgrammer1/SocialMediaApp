const mongoose = require('mongoose');
const PostSchema = new mongoose.Schema({
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dislike'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommentText'
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        
    },
    mediaUrl: {
        type: String,
        
    },
    contentType: {
        type: String,
        
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    privacyStatus: {
        type: String,
        enum: ['public', 'private', 'friends only'],
        default: 'public'
    },

}, {
    timestamps: true
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
