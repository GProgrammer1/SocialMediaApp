const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentTextSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
}, {
    timestamps: true
});

const CommentText = mongoose.model('CommentText', commentTextSchema);

module.exports = CommentText;