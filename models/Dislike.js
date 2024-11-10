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
        required: true
    }
}, {
    timestamps: true
});
const Dislike = mongoose.model('Dislike', DislikeSchema);
module.exports = Dislike;