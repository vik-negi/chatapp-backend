const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const OTPSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600,
  },
});

const OTP = model("otp", OTPSchema);
module.exports = OTP;
