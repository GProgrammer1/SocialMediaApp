const mongoose = require('mongoose');
const ResetTokenSchema = new mongoose.Schema({
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

const ResetToken = mongoose.model('ResetToken', ResetTokenSchema);
module.exports = ResetToken;