// models/SchedulingWindow.js

const mongoose = require("mongoose");

const timeRangeSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  start: { type: String, required: true },
  end: { type: String, required: true },
});

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    windows: [timeRangeSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SchedulingWindow", scheduleSchema);
