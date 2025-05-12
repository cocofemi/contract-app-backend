const express = require("express");
const meetingController = require("../controllers/meetingController");

const router = express.Router();

router.post("/create/meeting", meetingController.createMeeting);
router.get("/meetings", meetingController.getMeetings);

module.exports = router;
