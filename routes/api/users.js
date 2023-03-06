const express = require("express");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { auth } = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const {
  sendVerificationMail,
  sendResetPasswordMail,
  sendForgotUsernameMail,
} = require("../../config/send_Mail");
const nodemailer = require("nodemailer");
const Deals = require("../../models/Deals");

const router = express.Router();

//register a user
// @post request
// end point :  /api/users

router.post(
  "/",
  [
    check("email", "Enter a valid Email").isEmail(),
    check("password", "Password is required").not().isEmpty(),
    check("username", "Username is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructuring registeration fields

    const { email, password, username } = req.body;

    try {
      let user = await User.findOne({ email: email.toLowerCase() });
      let user_name = await User.findOne({ username });

      //generate OTP Code
      const otpCode = Math.floor(Math.random() * 1000000) + 1;

      if (user) {
        console.log(user);
        return res.status(400).json({
          errors: [
            {
              msg:
                "Someone has been already registered with this email , plz try another one",
            },
          ],
        });
      } else if (user_name) {
        console.log(user);
        return res.status(400).json({
          errors: [
            {
              msg: "Username already taken by someone else",
            },
          ],
        });
      } else {
        sendVerificationMail(email, otpCode);
        user = new User({
          email: email.toLowerCase(),
          password,
          username,
          otpCode,
        });

        // encrypting password using bcrypt js

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);
        await user.save();

        //generating token using jsonwebtoken

        const payload = {
          user: {
            id: user.id,
          },
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: "2 days" },
          (err, token) => {
            if (err) throw err;
            res.json({
              msg:
                "Account Verification Email sent to your mail , Please verify your account",
              token,
              user,
            });
          }
        );
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

//verify user account
// @put request
// end point :  /api/users/user-account/verify

router.put(
  "/user-account/verify",
  [
    check("email", "Email is required").isEmail(),
    check("otpCode", "OTP Code is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let { otpCode, email } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ msg: "No Account is detected for this email" });
      } else {
        if (user.otpCode === otpCode) {
          user.isVerified = true;
          user.otpCode = null;
          await user.save();
          res.json({
            msg: "Your Account has been successfully verified",
            user,
          });
        } else {
          res
            .status(400)
            .json({ errors: [{ msg: "OTP code is invalid or mismatched" }] });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

//send instructions for reset password to user's mail
// @post request
// end point :  /api/users/send-reset-password

router.post(
  "/send-reset-password",
  [check("email", "Enter a valid Email").isEmail()],
  async (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body; //generate OTP Code
    const resetCode = Math.floor(Math.random() * 1000000) + 1;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          errors: [
            {
              msg:
                "No Account is detected for this email , Please provide your registered email",
            },
          ],
        });
      } else {
        let resetToken = "";
        const payload = {
          user: {
            id: user.id,
          },
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: "300s" },
          async (err, token) => {
            if (err) throw err;
            resetToken = token;
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
                <p>Your request to reset password has been approved. plz use the following button to reset your password.</p>
                <a href="${process.env.BASE_URL}/reset-password/${resetToken}/${resetCode}"><button style="background: orange;margin: 0 auto;width: max-content;padding: 10px;color: white;border-radius: 4px;border-width: 0.5px; cursor: pointer;">Click To Reset Your Password </button></a>
                <p style="font-size:0.9em;">Regards,<br />Thrifle Deals</p>
                    <hr style="border:none;border-top:1px solid #eee" />
                  <p style="font-size:0.7em; color: red"><span style="font-weight: bold;">NOTE:</span> if you didn't request to reset your password than feel free to ignore this email</p>
                  <p style="font-size:0.7em; color: red"><span style="font-weight: bold;">Attention:</span> This reset password Email is valid for only 5 minutes</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                  <p>Thrifle Deals</p>
                  <p></p>
                </div>
              </div>
            </div>`,
            };
            await transporter.sendMail(mailOptions, async (error, info) => {
              if (error) {
                res.json({ errorMsg: "Email not sent", error: error });
              } else {
                user.resetCode = resetCode;
                await user.save();
                res.json({
                  msg:
                    "Instructions for reset your password has been successfully sent to your mail",
                });
              }
            });
          }
        );
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// Verify OTP
// @put request
// end point :  /api/users/verify-otp/reset-password

router.put(
  "/verify-otp/reset-password",
  [
    check("email", "Email is required").isEmail(),
    check("resetCode", "OTP Code is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let { resetCode, email } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ msg: "No Account is detected for this email" });
      } else {
        if (user.resetCode === resetCode) {
          user.isRequestedToResetPassword = true;
          user.resetCode = null;
          await user.save();
          res.json({
            msg: "OTP for reset password request successfully verified",
            user,
          });
        } else {
          res.status(400).json({ msg: "OTP code is invalid or mismatched" });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// Finish reset password request
// @put request
// end point :  /api/users/request/reset-password/finish

router.put(
  "/request/reset-password/finish",
  [
    check("resetToken", "Reset Token is required").not().isEmpty(),
    check("resetCode", "Reset Code is required").not().isEmpty(),
    check("password", "Password is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let { resetToken, resetCode, password } = req.body;
    try {
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      const user = decoded.user;

      const findUser = await User.findById(user.id);

      if (!user) {
        res.status(401).json({ msg: "Your session has been expired" });
      } else if (resetCode !== findUser.resetCode) {
        res.status(401).json({ msg: "Otp Code is invalid" });
      } else {
        const salt = await bcrypt.genSalt(10);

        findUser.password = await bcrypt.hash(password, salt);
        findUser.resetCode = null;
        await findUser.save();
        res.json({ msg: "Password has been reset successfully", findUser });
      }
    } catch (error) {
      res
        .status(401)
        .json({ msg: "Your session has been expired", error: error.message });
    }
  }
);

// Change password request
// @post request
// end point :  /api/users/change-password

router.post(
  "/change-password",
  auth,
  [
    check("currentPassword", "Current Password is required").not().isEmpty(),
    check("password", "Password is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructuring  fields

    const { currentPassword, password } = req.body;

    try {
      let user = await User.findById(req.user.id);

      if (user) {
        const matchPassword = await bcrypt.compare(
          currentPassword,
          user.password
        );
        if (!matchPassword) {
          return res.status(400).json({
            errors: [{ msg: "Your current password is not matched" }],
          });
        } else {
          const salt = await bcrypt.genSalt(10);

          user.password = await bcrypt.hash(password, salt);
          await user.save();
          return res
            .status(200)
            .json({ msg: "Your password has been changed" });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }
);

// get Your profile
// @get request
// end point :  /api/users/me

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(200).json({ msg: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

// get single user by id
// @get request
// end point :  /api/users/:user_id

router.get("/:user_id", async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id).select([
      "-password",
      "-isDisabled",
      "-isAdmin",
      "-otpCode",
      "-resetCode",
      "-isRequestedToResetPassword",
    ]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    if (error.kind == "ObjectId") {
      res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ msg: "Server Error", error });
  }
});

// edit user profile
// @put request
// end point :  /api/users/edit-profile

router.put("/edit-profile", auth, async (req, res) => {
  try {
    const { firstName, lastName, profileImage, phone_number } = req.body;
    let user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
    }
    user.firstName = firstName;
    user.lastName = lastName;
    user.profileImage = profileImage;
    user.phone_number = phone_number;

    await user.save();

    return res.json(user);
  } catch (error) {
    if (error.kind == "ObjectId") {
      res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ msg: "Server Error", error });
  }
});

// forgot username
// @post request
// end point :  /api/users/forgot-username

router.post(
  "/forgot-username",
  check("email", "Email is required").isEmail(),
  async (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructuring  fields

    const { email } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          errors: [
            {
              msg: "User not found within this email.",
            },
          ],
        });
      }
      await sendForgotUsernameMail(email, user.username).then((response) => {
        return res.status(200).json({
          result: "Your username has been successfully sent to your email",
        });
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }
);

// delete user account
// @delete request
// end point :  /api/users/delete-account

router.delete("/delete-account", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const findUserDeals = await Deals.find({ user_id: req.user.id });

    if (findUserDeals.length > 0) {
      const DealsToBeDeleted = [];

      for (let index = 0; index < findUserDeals.length; index++) {
        DealsToBeDeleted.push(findUserDeals[index]._id);
      }

      const deleteRes = await Deals.deleteMany({
        user_id: req.user.id,
        _id: { $in: DealsToBeDeleted },
      });
    }

    const deleteUserRes = await user.remove();

    return res.status(200).json({
      msg: "User has been removed successfully",
      deletedDeals: findUserDeals,
    });
  } catch (error) {
    res.status(500).json({ msg: "server error", error: error });
  }
});

//script to assign a role
router.put('/assign-all', async(req, res) => {
  try {
    const users = await User.find();
    let Users = [];

  for(let index = 0; index < users.length; index++){
    let user = await User.findOneAndUpdate({ _id: users[index]._id }, { role: users[index].isAdmin ? "admin" : "standard_user"});
    Users.push(user);
  }

  return res.status(200).json({msg: "All users has assigned a role", Users})

  } catch (error) {
    console.log('Error is', error);
  }
}) 

module.exports = router;
