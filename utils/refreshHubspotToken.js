const axios = require("axios");

async function refreshHubspotToken(refreshToken) {
  try {
    const res = await axios.post(
      "https://api.hubapi.com/oauth/v1/token",
      null,
      {
        params: {
          grant_type: "refresh_token",
          client_id: process.env.HUBSPOT_CLIENT_ID,
          client_secret: process.env.HUBSPOT_SECRET_ID,
          refresh_token: refreshToken,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return res.data; // includes access_token
  } catch (err) {
    console.error(
      "🔁 HubSpot token refresh failed:",
      err?.response?.data || err.message
    );
    return null;
  }
}

module.exports = { refreshHubspotToken };
