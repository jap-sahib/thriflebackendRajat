const express = require("express");
const { auth, admin } = require("../../middleware/auth");
const WebLogo = require("../../models/Logo");
const { check, validationResult } = require("express-validator");

const router = express.Router();

// post a logo image
// @post request
// end point :  /api/web/add-logo

router.post(
  "/add-logo",
  [auth, admin, [check("image", "Image is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { image } = req.body;
      const newLogo = new WebLogo({
        image,
        user_id: req.user.id,
      });
      await newLogo.save();
      return res.json({ msg: " Your Logo has been posted", LogoInfo: newLogo });
    } catch (error) {
      res.status(500).json({ msg: "Server Error", error: error });
    }
  }
);

// enable a logo image to show on website
// @put request
// end point :  /api/web/enable-logo-image/:logo_id

router.put("/enable-logo-image/:logo_id", auth, admin, async (req, res) => {
  try {
    let findLogo = await WebLogo.findById(req.params.logo_id);
    let findEnabledLogo = await WebLogo.findOne({ isEnabled: true });
    if (findLogo) {
      findLogo.isEnabled = true;
      await findLogo.save();
      res.json({ msg: "Logo has been enabled" });
      if (findEnabledLogo) {
        findEnabledLogo.isEnabled = false;
        await findEnabledLogo.save();
      }
      res.json({ msg: "Enabled Logo not found" });
    }
    res.json({ msg: "logo not found" });
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.json({ msg: " Logo not found" });
    }
    res.status(500).json({ msg: "Server error", error: error });
  }
});

// get enabled logo
// @get request
// end point :  /api/web/get/enabled-logo

router.get("/get/enabled-logo", async (req, res) => {
  try {
    const findEnabledLogo = await WebLogo.findOne({ isEnabled: true });
    if (!findEnabledLogo) {
      return res.status(404).json({ msg: "You did'nt set a default logo" });
    }
    res.json(findEnabledLogo);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error });
  }
});

// get all logos
// @get request
// end point :  /api/web/get/logos/all

router.get("/get/logos/all", auth, admin, async (req, res) => {
  try {
    const logos = await WebLogo.find();
    return res.json(logos);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error });
  }
});

// delete a logo
// @delete request
// end point :  /api/web/delete/logo/:logo_id

router.delete("/delete/logo/:logo_id", auth, admin, async (req, res) => {
  try {
    const findLogo = await WebLogo.findById(req.params.logo_id);
    if (findLogo.isEnabled === true) {
      return res.status(400).json({ msg: "You cannot delete enabled logo" });
    }
    await findLogo.remove();
    return res.json({ msg: "Logo has been removed successfully" });
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Logo not found" });
    }
    res.status(500).json({ msg: "Server error", error: "Logo not found with perspective Id" });
  }
});

module.exports = router;
