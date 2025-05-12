const express = require("express");
const router = express.Router();
const SchedulingLink = require("../models/scheduleLink");

const createScheduleLink = async (req, res) => {
  try {
    const {
      userId,
      schedulingWindowId,
      slug,
      maxUses,
      expiresAt,
      meetingLength,
      maxDaysInAdvance,
      questions,
    } = req.body;

    const link = new SchedulingLink({
      userId,
      schedulingWindowId,
      slug,
      maxUses: maxUses || null,
      expiresAt: expiresAt || null,
      meetingLength,
      maxDaysInAdvance,
      questions,
    });

    await link.save();

    res.status(201).json({ success: true, data: link });
  } catch (err) {
    console.error("Error creating link:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createScheduleLink };
