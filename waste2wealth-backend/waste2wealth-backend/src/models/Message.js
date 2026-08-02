const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true }, // deterministic: sorted [userA_userB]
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    waste: { type: mongoose.Schema.Types.ObjectId, ref: 'WasteListing' }, // optional context

    text: { type: String, required: true, trim: true },
    attachments: [{ type: String }],

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
