const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 16,
    },
    deviceNotificationId: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    chatWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        image: {
          url: {
            type: String,
            default:
              "https://res.cloudinary.com/dolqf9s3y/image/upload/v1668325949/TikTok_mqkhq0.png",
          },
          public_id: String,
        },
        bio: String,
        name: String,
        lastMessage: {
          isSent: {
            type: Boolean,
            required: true,
            default: true,
          },
          receiverUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
          },
          senderUserId: {
            type: mongoose.Schema.Types.ObjectId,
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
      },
    ],

    email: {
      type: String,
      unique: true,
      trim: true,
      validate: {
        validator: (value) => {
          const re =
            /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
          return value.match(re);
        },
        message: "Please enter a valid email address",
      },
    },
    mobile: {
      type: String,
      trim: true,
      unique: true,
    },
    age: {
      type: Number,
      min: 8,
    },
    gender: {
      type: String,
    },
    profileImage: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dolqf9s3y/image/upload/v1668325949/TikTok_mqkhq0.png",
      },
      public_id: String,
    },
    profileViews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    accountType: {
      type: String,
      required: true,
      enm: ["admin", "user"],
      trim: true,
      default: "user",
    },
  },
  { Timestamp: true }
);
UserSchema.index({ location: "2dsphere" });

module.exports = User = mongoose.model("user", UserSchema);
