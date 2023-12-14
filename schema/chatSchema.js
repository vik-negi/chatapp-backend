const Mongoose = require("mongoose");
const { conn } = require("../config/db.js");

const ChatSchema = new Mongoose.Schema(
  {
    senderUserId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiverUserId: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    chatStartOn: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isBlocked: {
      type: Boolean,
      required: true,
      default: false,
    },
    lastRead: {
      type: Mongoose.Schema.Types.ObjectId,
    },
    chat: [
      {
        isSent: {
          type: Boolean,
          required: true,
          default: true,
        },
        receiverUserId: {
          type: Mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        senderUserId: {
          type: Mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        sendBy: {
          type: String,
          required: true,
        },
        recieveBy: {
          type: String,
          required: true,
        },

        message: {
          type: String,
          required: true,
        },
        isRead: {
          type: Boolean,
          required: true,
          default: false,
        },
        isDeleted: {
          type: Boolean,
          required: true,
          default: false,
        },
        isPinned: {
          type: Boolean,
          required: true,
          default: false,
        },
        isForwarded: {
          type: Boolean,
          required: true,
          default: false,
        },
        reaction: {
          type: String,
        },
        timestamp: {
          type: Date,
          required: true,
          default: Date.now,
        },
        isReceived: {
          type: Boolean,
          required: true,
          default: false,
        },
        messageType: {
          type: String,
          required: true,
          default: "text",
        },
      },
    ],
  },
  { Timestamp: true }
);

const Chat = conn.model("chat", ChatSchema);
module.exports = {
  Chat,
};
