const express = require("express");
const scheduleWindowController = require("../controllers/scheduleController");

const router = express.Router();
router.post("/scheduling-window/new", scheduleWindowController.addSchedule);
router.post(
  "/create/schedule-link",
  scheduleWindowController.createScheduleLink
);
router.get("/scheduling-link/:slug", scheduleWindowController.getSchdeduleLink);
router.get("/schedule-dates", scheduleWindowController.getSchedule);

module.exports = router;
