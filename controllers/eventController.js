const User = require("../models/user");
const ConnectedAccounts = require("../models/connectedAccounts");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

//function to get refresh token for OAuth2Client
// This function will be called when the user clicks on the "Authorize" button
// and will redirect the user to the Google authorization page
const getRefreshToken = async (req, res) => {
  const { user_id, type } = req.query;
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL
  );

  const scopes = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const state = JSON.stringify({
    user_id: user_id,
    type: type, // or "login"
  });

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state: state,
  });

  res.json({ authUrl: url });
};

const googleRedirectUrl = async (req, res) => {
  const { code, state } = req.query;
  const decodedState = decodeURIComponent(state);
  const { user_id, type } = JSON.parse(decodedState);

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URL
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (type === "login") {
      const user = await User.findByIdAndUpdate(
        user_id,
        {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
        { new: true }
      );
    } else if (type === "add-account") {
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();

      const accountEmail = data.email;

      const connectedAccounts = new ConnectedAccounts({
        email: accountEmail,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        userId: user_id,
      });
      await connectedAccounts.save();
    }
    res.redirect(process.env.SUCCESS_URI);

    // Save tokens.access_token and tokens.refresh_token
  } catch (err) {
    console.error("OAuth error:", err);
    res.redirect(process.env.NOT_FOUND_URI);
  }
};

const getEvents = async (req, res) => {
  const { user_id, email } = req.query;
  if (!user_id || !email) {
    return res.status(400).json({ message: "Missing user_id or email" });
  }

  try {
    let account = await User.findOne({ _id: user_id, email });
    let isPrimary = true;

    if (!account) {
      account = await ConnectedAccounts.findOne({ userId: user_id, email });
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      isPrimary = false;
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    // ✅ Attempt API call — this will refresh token automatically if needed
    const calendar = google.calendar({ version: "v3", auth });

    const events = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    // ✅ Save new access token if refreshed
    const newAccessToken = auth.credentials.access_token;

    if (newAccessToken && newAccessToken !== account.accessToken) {
      if (isPrimary) {
        await User.findByIdAndUpdate(user_id, { accessToken: newAccessToken });
      } else {
        await ConnectedAccounts.findByIdAndUpdate(account._id, {
          accessToken: newAccessToken,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: events.data.items,
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllConnectedAccounts = async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  try {
    const user = await User.findById(user_id).lean();
    const mainAccount =
      user?.accessToken && user?.refreshToken
        ? {
            email: user.email,
            type: "primary",
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
          }
        : null;

    const connectedAccounts = await ConnectedAccounts.find({
      userId: user_id,
    }).lean();

    const formattedAccounts = connectedAccounts.map((account) => ({
      email: account.email,
      type: "connected",
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
    }));
    const accounts = mainAccount ? [...formattedAccounts] : formattedAccounts;

    res.json({ accounts });
  } catch (err) {
    console.error("Failed to fetch accounts", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSingleConnectedAccount = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Missing user_id or email" });
  }
  try {
    let account = await User.findOne({ email });
    let isPrimary = true;

    if (!account) {
      account = await ConnectedAccounts.findOne({ email });
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      isPrimary = false;
    }
    // const account = await ConnectedAccounts.find({ email: email }).lean();
    // if (!account) {
    //   return res.status(404).json({ error: "Account not found" });
    // }
    res.status(200).send(account);
  } catch (error) {
    console.error("Failed to fetch account", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const connectHubspotAccount = async (req, res) => {
  const { user_id } = req.query;

  const scopes = ["crm.objects.contacts.read", "oauth"];
  const state = JSON.stringify({ user_id });

  const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${
    process.env.HUBSPOT_CLIENT_ID
  }&scope=${scopes.join("%20")}&redirect_uri=${encodeURIComponent(
    process.env.HUBSPOT_REDIRECT_URL
  )}&state=${encodeURIComponent(state)}`;

  res.json({ authUrl });
};

const hubspotCallback = async (req, res) => {
  const { code, state } = req.query;

  const { user_id } = JSON.parse(decodeURIComponent(state));

  try {
    const tokenRes = await axios.post(
      "https://api.hubapi.com/oauth/v1/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.HUBSPOT_CLIENT_ID,
          client_secret: process.env.HUBSPOT_SECRET_ID,
          redirect_uri: process.env.HUBSPOT_REDIRECT_URL,
          code,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;
    const updateHubspot = await User.findByIdAndUpdate(user_id, {
      $push: {
        hubspot: {
          accessToken: access_token,
          refreshToken: refresh_token,
        },
      },
    });

    console.log(updateHubspot);

    res.redirect(process.env.HUBSPOT_SUCCESS_URI);
  } catch (err) {
    console.error("HubSpot OAuth error:", err.response?.data || err.message);
    res.status(500).send("OAuth failed");
  }
};

module.exports = {
  getRefreshToken,
  getEvents,
  googleRedirectUrl,
  getAllConnectedAccounts,
  getSingleConnectedAccount,
  connectHubspotAccount,
  hubspotCallback,
};
