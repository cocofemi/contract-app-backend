const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");
const path = require("path");
const express = require("express");
const Cors = require("cors");
var bodyParser = require("body-parser");
const dotenv = require("./dotenvConfig")();
const dbConnect = require("./db/dbConnect");

const authRoutes = require("./routes/authRoute");
const eventRoutes = require("./routes/eventRoute");
const meetingRoutes = require("./routes/meetingRoute");
const scheduleWindowRoutes = require("./routes/scheduleRoutes");

const app = express();
const port = process.env.PORT || 9000;
const baseURL = process.env.PUBLIC_BASE_URL || "http://localhost:9000";

dbConnect();

const corsOption = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(Cors(corsOption));

app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => console.log(`Listening on port ${port}`));

app.use(express.json({ limit: "50mb" }));

app.use("/contract-app/v1", authRoutes);
app.use("/contract-app/v1", eventRoutes);
app.use("/contract-app/v1", meetingRoutes);
app.use("/contract-app/v1", scheduleWindowRoutes);
