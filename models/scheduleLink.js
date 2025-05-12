const mongoose = require("mongoose");

const schedulingLinkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    schedulingWindowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchedulingWindow",
      required: true,
    },
    slug: { type: String, required: true, unique: true },
    maxUses: { type: Number, default: null },
    expiresAt: { type: Date, default: null },
    meetingLength: { type: Number, required: true },
    maxDaysInAdvance: { type: Number, required: true },
    questions: [String],
    currentUses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SchedulingLink", schedulingLinkSchema);
