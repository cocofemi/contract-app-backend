const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchedulingLink",
      required: true,
    },
    email: { type: String, required: true },
    linkedin: { type: String, default: "" },
    answers: [String],
    scheduledTime: { type: String, required: true }, // can be ISO or "10:30 AM"
    scheduledDate: { type: String, required: true },
    augmentedNotes: { type: String, default: null },
    source: {
      type: String,
      enum: ["hubspot", "linkedin", "none"],
      default: "none",
    },
    contactSnapshot: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);
