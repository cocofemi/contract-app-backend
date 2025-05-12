const path = require("path");
require("dotenv").config({ path: "../.env" });

const nodemailer = require("nodemailer");
const ejs = require("ejs");

async function meetingEmail(email, linkedinUrl, answers, time, augmented) {
  const template = await ejs.renderFile(
    path.join(__dirname, "../views/bookingEmail.ejs"),
    {
      email,
      linkedinUrl,
      answers,
      time,
      augmented,
    }
  );
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.DO_NOT_REPLY,
      pass: process.env.DO_NOT_REPLY_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.DO_NOT_REPLY,
    to: email,
    subject: "You have a meeting - The-Contract-App",
    html: template,
  });
  console.log("Email sent:", info.messageId);
}

// sendEmail();

module.exports = { meetingEmail };
