const axios = require("axios");

async function refreshGoogleAccessToken(refreshToken) {
  try {
    const res = await axios.post("https://oauth2.googleapis.com/token", null, {
      params: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return res.data; // includes new access_token and expiry
  } catch (err) {
    console.error(
      "Google token refresh failed:",
      err.response?.data || err.message
    );
    return null;
  }
}

module.exports = { refreshGoogleAccessToken };
