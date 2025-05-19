const axios = require("axios");

async function getNotesForContact(contactId, accessToken) {
  const url = `https://api.hubapi.com/crm/v3/objects/notes`;

  try {
    const response = await axios.get(url, {
      params: {
        associations: `contact:${contactId}`,
        limit: 5,
        properties: ["hs_note_body"],
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.results || [];
  } catch (err) {
    console.error("Failed to fetch notes:", err.response?.data || err.message);
    return [];
  }
}

async function getNoteIdsForContact(contactId, accessToken) {
  const url = `https://api.hubapi.com/crm/v4/objects/contacts/${contactId}/associations/notes`;

  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.data.results?.map((assoc) => assoc.toObjectId) || [];
  } catch (err) {
    console.error(
      "Failed to fetch note associations:",
      err.response?.data || err.message
    );
    return [];
  }
}

async function getNotesByIds(noteIds, accessToken) {
  if (noteIds.length === 0) return [];

  const url = `https://api.hubapi.com/crm/v3/objects/notes/batch/read`;

  try {
    const res = await axios.post(
      url,
      {
        properties: ["hs_note_body"],
        inputs: noteIds.map((id) => ({ id })),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.results || [];
  } catch (err) {
    console.error(
      "Failed to fetch notes by ID:",
      err.response?.data || err.message
    );
    return [];
  }
}

module.exports = { getNotesForContact, getNoteIdsForContact, getNotesByIds };
