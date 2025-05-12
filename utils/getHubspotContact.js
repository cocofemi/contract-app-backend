const axios = require("axios");

async function getHubspotContactByEmail(email, accessToken) {
  const url = `https://api.hubapi.com/crm/v3/objects/contacts/search`;

  try {
    const res = await axios.post(
      url,
      {
        filterGroups: [
          {
            filters: [{ propertyName: "email", operator: "EQ", value: email }],
          },
        ],
        properties: [
          "firstname",
          "lastname",
          "email",
          "phone",
          "notes_last_contacted",
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = res.data.results?.[0] || null;
    return result;
  } catch (err) {
    console.error(
      "HubSpot contact lookup failed:",
      err?.response?.data || err.message
    );
    return null;
  }
}

module.exports = { getHubspotContactByEmail };
