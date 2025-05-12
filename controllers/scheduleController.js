const SchedulingWindow = require("../models/schedule");
const SchedulingLink = require("../models/scheduleLink");

const addSchedule = async (req, res) => {
  const { userId, windows } = req.body;

  if (!userId || !Array.isArray(windows)) {
    return res
      .status(400)
      .json({ message: "Missing userId or windows array." });
  }

  try {
    const schedulingWindow = new SchedulingWindow({ userId, windows });
    await schedulingWindow.save();

    res.status(201).json({ success: true, data: schedulingWindow });
  } catch (err) {
    console.error("Error creating scheduling window:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const getSchedule = async (req, res) => {
  const { userId } = req.query;

  try {
    const data = await SchedulingWindow.findOne({ userId });
    if (!data) {
      return res.status(404).json({ message: "No availability found." });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error fetching schedule:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to load availability" });
  }
};

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

    const formattedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    const link = new SchedulingLink({
      userId,
      schedulingWindowId,
      slug: formattedSlug,
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

const getSchdeduleLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await SchedulingLink.findOne({ slug });
    if (!link) return res.status(404).json({ success: false });

    res.json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

module.exports = {
  addSchedule,
  getSchedule,
  createScheduleLink,
  getSchdeduleLink,
};
