const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }, // e.g., 24 hours later
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dislike' }]
}, {
});

StorySchema.pre('save', function(next) {
  // Set expiresAt to 24 hours after createdAt
  this.expiresAt = new Date(this.createdAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  next();
});

const Story = mongoose.model('Story', StorySchema);

module.exports = Story;
