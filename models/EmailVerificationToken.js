const mongoose = require('mongoose');
const EmailVerificationTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
    }

});

const EmailVerificationToken = mongoose.model('EmailVerificationToken', EmailVerificationTokenSchema);
module.exports = EmailVerificationToken;