const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");

var messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversation",
    },
    content: {
      type: String,
      require: true,
    },
    type: {
      type: String,
      enum: ["TEXT", "IMAGE", "STICKER", "VIDEO", "FILE"],
      require: true,
    },
    deletedUserIds: {
      type: [ObjectId],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
