const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Please provide your first name"],
    },
    lastname: {
      type: String,
      required: [true, "Please provide your last name"],
    },
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
    googlecalendar: {
      type: Boolean,
      default: false,
    },
    hubspot: [
      {
        accessToken: {
          type: String,
          default: null,
        },
        refreshToken: {
          type: String,
          default: null,
        },
      },
    ],
    googleId: {
      type: String,
      required: ["GoogleId is required for local accounts."],
      unique: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/dhchzkdbz/image/upload/v1723686577/display_pictures/1-Blank-TikTok-Default-PFP_ppas0c.jpg",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);
