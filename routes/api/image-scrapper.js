const express = require("express");
var Scraper = require("images-scraper");

const router = express.Router();

const google = new Scraper({
  safe: true,   // enable/disable safe search
  puppeteer: {
    headless: true,
  },
});

// scrap images
// @post request
// end point : /api/scrap/images

router.post("/images", async (req, res) => {
  try {
    const { imageTitle } = req.body;
    const imageResults = await google.scrape(imageTitle, 10);
    return res.json(imageResults);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
