const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentTextSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommentText'
    }],
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommentText'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
    }
}, {
    timestamps: true
});

const CommentText = mongoose.model('CommentText', commentTextSchema);

module.exports = CommentText;