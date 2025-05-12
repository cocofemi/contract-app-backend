const mongoose = require("mongoose");

const ConnectedAccounts = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an Email!"],
      unique: [true, "Email Exist"],
    },
    accessToken: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      reuired: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.model.Users ||
  mongoose.model("ConnectedAccounts", ConnectedAccounts);
