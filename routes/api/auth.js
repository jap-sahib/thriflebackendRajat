const express = require("express");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const router = express.Router();

//Login a user
// @post request
// end point :  /api/auth

//Authentication User And request to get token

router.post("/", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  try {
    if (!username) {
      return res.json({ msg: "User name is required" });
    }

    if (!password) {
      return res.json({ msg: "Password is required" });
    }

    let user = await User.findOne({username});

    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid username" }] });
    }
    if (user.isDisabled === true) {
      return res.status(400).json({
        errors: [
          {
            msg: "Your account has been banned by an admin, please contact admin support",
          },
        ],
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid Password" }] });
    }

    user.isOnline = true;
    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//enable offline to user
// @put request
// end point :  /api/auth/user/:user_id

router.put("/user/offline/:user_id", async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.isOnline = false;
    user.save();
    return res.json(user);
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res
        .status(404)
        .json({ msg: "User not found", error: error.message });
    }
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

module.exports = router;
