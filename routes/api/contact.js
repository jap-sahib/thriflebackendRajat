const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// contact with us 
// @post request
// end point: api/contact_us/send

router.post("/send", async (req, res) => {
  let { name, email, message } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SSL,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: "Thrifle message alert",
      to: process.env.EMAIL_ADDRESS,
      subject:"Thrifle Message alert",
      html:
        "<p><ul><li>Name :" +
        name +
        "</li><li>Email : " +
        email +
        "</li><li>Message : " +
        message +
        "</li></ul> </p>",
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
      res.status(200).json({ msg: "Message Sent Successfully" });
    });
  } catch (error) {
    console.error(erro.message);
    res.status(500).json({ msg: "Message Error" });
  }
});

module.exports = router;
