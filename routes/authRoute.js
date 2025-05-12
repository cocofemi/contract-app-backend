const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();
router.post("/google/auth", authController.googleLogin);
router.get("/user", authController.getUser);

module.exports = router;
