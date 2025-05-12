const express = require("express");
const eventController = require("../controllers/eventController");

const router = express.Router();
router.get("/google/accesstoken", eventController.getRefreshToken);
router.get("/get/events", eventController.getEvents);
router.get("/google/callback", eventController.googleRedirectUrl);
router.get("/google/accounts", eventController.getAllConnectedAccounts);
router.get("/google/account", eventController.getSingleConnectedAccount);
router.get("/hubspot/auth-url", eventController.connectHubspotAccount);
router.get("/hubspot/callback", eventController.hubspotCallback);

module.exports = router;
