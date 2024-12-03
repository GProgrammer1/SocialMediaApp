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
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    status: {
        type: String,
        enum: ['delivered', 'seen', 'sent','no connection'],
        default: 'sent'
    }
}, {
    timestamps: true
});

MessageSchema.pre('save', function (next) {
    const offset = new Date().getTimezoneOffset() * 60000; // offset in milliseconds
    this.timestamp = new Date(Date.now() - offset);
    next();
});

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;