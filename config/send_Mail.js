const nodemailer = require("nodemailer");

// send account verification email

const sendVerificationMail = async (email, otpCode) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: "Email Account Verification ",
    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: orange;text-decoration:none;font-weight:600">Thrifle Deals</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Thank you for choosing Thrifle Deals. Use the following OTP to verify your account.</p>
      <h2 style="background: #fff;margin: 0 auto;width: max-content;padding: 0 10px;color: gray;border-radius: 4px;">${otpCode}</h2>
      <p style="font-size:0.9em;">Regards,<br />Thrifle Deals</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>Thrifle Deals</p>
        <p></p>
      </div>
    </div>
  </div>`,
  };
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error.message);
    }
    console.log("Email for account verification sent successfully");
  });
};

// send email for reset password

const sendResetPasswordMail = async (email, resetCode) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: "Reset Your Password",
    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: orange;text-decoration:none;font-weight:600">Thrifle Deals</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Your request to reset password has been approved. plz use the following OTP to reset your password.</p>
      <h2 style="background: #fff;margin: 0 auto;width: max-content;padding: 0 10px;color: gray;border-radius: 4px;">${resetCode}</h2>
      <p style="font-size:0.9em;">Regards,<br />Thrifle Deals</p>
          <hr style="border:none;border-top:1px solid #eee" />
        <p style="font-size:0.7em; color: red"><span style="font-weight: bold;">NOTE:</span> if you didn't request to reset your password than feel free to ignore this email</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>Thrifle Deals</p>
        <p></p>
      </div>
    </div>
  </div>`,
  };
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email for reset password request sent successfully");
    }
  });
};



// send forgot username email

const sendForgotUsernameMail = async (email, username) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: "Reset Your Password",
    html: `

    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
      <tr>
        <td>
          <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
            <tr>
              <td style="height:80px;">&nbsp;</td>
            </tr>
            <tr>
              <td style="text-align:center;">
                <a href="https://thrifle.com" title="logo" target="_blank"> <img width="200" src="https://thriflebucket.s3.us-west-2.amazonaws.com/16.png/30253782-f08a-494c-a898-bbe46a218217" title="logo" alt="logo"> </a>
              </td>
            </tr>
            <tr>
              <td style="height:20px;">&nbsp;</td>
            </tr>
            <tr>
              <td>
                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px; background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                  <tr>
                    <td style="height:40px;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding:0 35px;">
                      <br><strong>Please use this username to login on thrifle
                                  </strong>.</p> <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                      <p style="color:#455056; font-size:18px;line-height:20px; margin:0; font-weight: 500;"> <strong style="display: block;font-size: 13px; margin: 0 0 4px; color:rgba(0,0,0,.64); font-weight:normal;">Username</strong>${username}<strong style="display: block; font-size: 13px; margin: 24px 0 4px 0; font-weight:normal; color:rgba(0,0,0,.64);"></strong> </p>  </td>
                  </tr>
                  <tr>
                    <td style="height:40px;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height:20px;">&nbsp;</td>
            </tr>
            <tr>
              <td style="text-align:center;">
                <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.thrifle.com</strong> </p>
              </td>
            </tr>
            <tr>
              <td style="height:80px;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `,
  };
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Your username has been sent to your provided email");
    }
  });
};

module.exports = { sendVerificationMail, sendResetPasswordMail, sendForgotUsernameMail };
