const User = require("../models/user");
const Meeting = require("../models/meeting");
const sendMail = require("../services/sendEmail");
const SchedulingLink = require("../models/scheduleLink");
const mongoose = require("mongoose");
const { getHubspotContactByEmail } = require("../utils/getHubspotContact");
const { generateContextNote } = require("../utils/generateContextNote");
const { scrapeLinkedinMeta } = require("../utils/scrapeLinkedinMeta");
const { refreshHubspotToken } = require("../utils/refreshHubspotToken");

const createMeeting = async (req, res) => {
  const {
    userId,
    linkId,
    email,
    linkedin,
    answers,
    scheduledTime,
    scheduledDate,
  } = req.body;

  if (!email || !scheduledTime) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields." });
  }

  try {
    const meeting = new Meeting({
      userId,
      linkId,
      email,
      linkedin,
      answers,
      scheduledTime,
      scheduledDate,
    });

    await meeting.save();

    let advisor = await User.findById(userId);
    let link = await SchedulingLink.findById(linkId);
    let accessToken = advisor?.hubspot?.[0]?.accessToken;
    let refreshToken = advisor?.hubspot?.[0]?.refreshToken;

    let hubspotContact = null;
    let contactContext = null;
    let source = "none";

    if (accessToken) {
      hubspotContact = await getHubspotContactByEmail(email, accessToken);
    }

    if (!hubspotContact && refreshToken) {
      const newToken = await refreshHubspotToken(refreshToken);

      if (newToken?.access_token) {
        // Update DB
        advisor.hubspot[0].accessToken = newToken.access_token;
        await advisor.save();

        // Retry
        accessToken = newToken.access_token;
        hubspotContact = await getHubspotContactByEmail(email, accessToken);
      }
    }

    // Update the meeting with the contact snapshot (if found)
    if (hubspotContact) {
      meeting.contactSnapshot = hubspotContact;
      meeting.source = "hubspot";
      await meeting.save();
      contactContext = hubspotContact.properties;
      source = "hubspot";
    }

    if (!contactContext && linkedin) {
      const profile = await scrapeLinkedinMeta(linkedin);
      console.log("Profile:", profile);
      if (profile) {
        meeting.contactSnapshot = profile;
        meeting.source = "linkedin";
        await meeting.save();
        contactContext = profile;
        source = "linkedin";
      }
    }

    const augmented = await generateContextNote({
      answers,
      contactSnapshot: contactContext,
    });

    meeting.augmentedNotes = augmented;
    await meeting.save();

    await sendMail.meetingEmail(
      email,
      linkedin,
      answers,
      scheduledTime,
      scheduledDate,
      augmented
    );

    res.status(201).json({ success: true, data: meeting });
  } catch (err) {
    console.error("Error saving meeting:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getMeetings = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Missing userId",
    });
  }

  try {
    const meetings = await Meeting.aggregate([
      {
        $lookup: {
          from: "schedulinglinks",
          localField: "linkId",
          foreignField: "_id",
          as: "link",
        },
      },
      { $unwind: "$link" },
      {
        $match: {
          "link.userId": new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $addFields: {
          slug: "$link.slug", // ✅ bring slug into root
        },
      },
      {
        $project: {
          link: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createMeeting, getMeetings };
