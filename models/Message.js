const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['delivered', 'seen', 'sent','no connection'],
        default: 'unread'
    }
}, {
    timestamps: true
});
const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;