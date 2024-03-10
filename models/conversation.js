const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");
// Declare the Schema of the Mongo model
var conversationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    members: [ObjectId],
    isJoinFromLink: {
      type: Boolean,
      default: true,
    },
    lastMessageId: ObjectId,
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ name: 'text' });

conversationSchema.statics.getListByUserId = async (userId) => {
  return await Conversation.find({
      members: { $in: [userId] },
  }).sort({ updatedAt: -1 });
};

module.exports = mongoose.model("conversation", conversationSchema);
