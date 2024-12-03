const mongoose = require('mongoose');
const DislikeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommentText',
    },
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
    }
}, {
    timestamps: true
});
const Dislike = mongoose.model('Dislike', DislikeSchema);
module.exports = Dislike;