const User = require("../models/user");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
const mongoose = require("mongoose");
const { refreshGoogleAccessToken } = require("../utils/refreshGoogleToken");

const formatUserResponse = (user) => ({
  success: true,
  userId: user._id,
  firstName: user.firstname,
  lastName: user.lastname,
  email: user.email,
  profilePicture: user.profilePicture,
  accessToken: user.accessToken || null,
});

const googleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name, picture } = payload;

    let user = await User.findOne({ googleId });

    if (!user) {
      // First-time user
      user = await User.create({
        googleId,
        email,
        firstname: given_name,
        lastname: family_name,
        profilePicture: picture,
      });
    } else {
      // Returning user: Refresh access token if possible
      if (user.refreshToken) {
        const newTokens = await refreshGoogleAccessToken(user.refreshToken);

        if (newTokens?.access_token) {
          user.accessToken = newTokens.access_token;
          // user.googleTokenExpiresAt = Date.now() + newTokens.expires_in * 1000;
          await user.save();
        }
      }
    }

    return res.status(200).json(formatUserResponse(user));
  } catch (error) {
    console.error("Google login error:", error.message || error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const getUser = async (req, res) => {
  const { user_id } = req.query;

  User.find({ _id: user_id })
    .then((data) => {
      res.status(200).send(data[0]);
    })
    .catch((e) => {
      return res.status(404).send("Error retrieving user");
    });
};

module.exports = { googleLogin, getUser };
