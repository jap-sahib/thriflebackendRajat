const express = require("express");
const { auth } = require("../../middleware/auth");
const Deals = require("../../models/Deals");
const { check, validationResult, body } = require("express-validator");
const Categories = require("../../models/Categories");
const User = require("../../models/User");
const { saveImageToS3Bucket } = require("../../services/save-image.service");
const { makeSlug } = require("../../services/slug.service");
const { makeKeywords } = require("../../services/keywords.service");
const router = express.Router();

//add deal
// @post request
// end point :  /api/deals

router.post(
  "/",
  [
    auth,
    [
      check("title", "Title of post is required").not().isEmpty(),
      check("description", "Discription is required").not().isEmpty(),
      // check("price", "Price is required").not().isEmpty(),
      check("category_name", "Category Name is required").not().isEmpty(),
      check("link", "link are required").not().isEmpty(),
      check("images", "images are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);

    let { title, description, price, category_name, link, images } = req.body;

    const deal = await Deals.findOne({ title });

    if (deal) {
      title = title + "(1)";
    }

    const slug = makeSlug(title);

    const keywords = makeKeywords(title);


    let dealUrl;
    let pattern = new RegExp("^https?://");

    try {
      const saveImageRes = await saveImageToS3Bucket(images);
      let category = await Categories.findOne({ name: category_name });
      if (category) {
        if (pattern.test(link)) {
          dealUrl = link;
        } else {
          dealUrl = "https://" + link;
        }

        const newDeal = new Deals({
          user_id: req.user.id,
          category_id: category._id,
          title,
          description,
          price,
          displayOnHome: false,
          category_name: category.name,
          link: dealUrl,
          images: saveImageRes,
          posted_by: user.isAdmin
            ? "Admin"
            : user.firstName + " " + user.lastName,
          slug,
          keywords,
        });
        await newDeal.save();
        return res.json({
          msg: " Your Deal has been posted successfully",
          newDeal,
        });
      }
      res.json({
        errors: [
          {
            msg: "Category not found",
          },
        ],
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }
);

//add and remove like
// @put request
// end point :  /api/deals/like/:id

router.put("/like/:id", auth, async (req, res) => {
  try {
    let deal = await Deals.findById(req.params.id).select("-counts");

    if (
      deal.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      deal.likes = deal.likes.filter(
        ({ user }) => user.toString() !== req.user.id
      );
      await deal.save();
      return res.json(deal.likes);
    } else {
      deal.likes.unshift({ user: req.user.id });
      await deal.save();
      return res.json(deal.likes);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

//Get All Deals
// @get request
// end point :  /api/deals

router.get("/", async (req, res) => {
  try {
    const { sorted, searchText, userId } = req.query;
    const searchPattern = new RegExp(".*" + searchText + ".*", "i");
    if (searchText) {
      const deals = await Deals.find({
        title: searchPattern,
        disabled: false,
        archive: false
      });
      return res.status(200).json(deals);
    }
    if (userId) {
      const deals = await Deals.find({
        user_id: userId,
        disabled: false,
        archive: false
      }).sort({ date: -1 });
      return res.status(200).json(deals);
    }

    if (sorted === "mostRecent") {
      const deals = await Deals.find({
        disabled: false,
        archive: false
      }).sort({ date: -1 });
      return res.status(200).json(deals);
    } else if (sorted === "views") {
      const deals = await Deals.find({
        disabled: false,
        archive: false
      }).sort({
        counts: -1,
      });
      return res.status(200).json(deals);
    } else if (sorted === "likes") {
      const deals = await Deals.find({
        disabled: false,
        archive: false
      }).sort({
        likes: -1,
      });
      return res.status(200).json(deals);
    } else if (sorted === "name") {
      const deals = await Deals.find({
        disabled: false,
        archive: false
      }).sort({ title: 1 });
      return res.status(200).json(deals);
    } else if (sorted === "ascOrder") {
      const deals = await Deals.find({ disabled: false, archive: false });
      return res.status(200).json(deals);
    }
    const deals = await Deals.find({
      disabled: false,
      archive: false
    }).sort({ date: -1 });
    return res.status(200).json(deals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server Error" });
  }
});

//Get Single Deal
// @get request
// end point :  /api/deals/get_single/:id

router.get("/get_single/:id", async (req, res) => {
  try {
    const deal = await Deals.findById(req.params.id);
    res.json(deal);
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Deal not found" });
    }
    res.status(500).json({ msg: "Server Error" });
  }
});

//Update Single Deal
//put request
// end point :  /api/deals/update_single/:id

router.put(
  "/update_single/:id",
  [
    auth,
    [
      check("title", "Title of post is required").not().isEmpty(),
      check("description", "Discription is required").not().isEmpty(),
      check("price", "Price is required").not().isEmpty(),
      check("category_name", "Category Name is required").not().isEmpty(),
      check("link", "link is required").not().isEmpty(),
      check("images", "images are required").not().isEmpty(),
      check("archive", "archive status are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { title, description, price, category_name, link, images, archive } = req.body;
    try {
      let deal = await Deals.findById(req.params.id);
      let user = await User.findById(req.user.id);
      const saveImageRes = await saveImageToS3Bucket(images);
      let category = await Categories.findOne({ name: category_name });
      let dealUrl;
      let pattern = new RegExp("^https?://");

      if (!deal) {
        res.status(404).json({ msg: "Deal Not Found" });
      } else if (!category) {
        res.json({
          errors: [
            {
              msg: "Category not Found",
            },
          ],
        });
      } else if (user.role === "admin" || user.role === "employee" || user._id === deal.user_id) {
        if (pattern.test(link)) {
          dealUrl = link;
        } else {
          dealUrl = "https://" + link;
        }
        deal.title = title;
        deal.description = description;
        deal.price = price;
        deal.link = dealUrl;
        deal.archive = archive;
        deal.images = saveImageRes;
        deal.category_name = category.name;
        deal.category_id = category._id;

        await deal.save();
        res.json({ msg: "Updated Successfuly" });
      }
    } catch (error) {
      console.error(error.message);
      if (error.kind == "ObjectId") {
        return res.status(404).json({ msg: "Deal not found" });
      }
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

//Add Count on Clicked
// @put request
// end point :  /api/deals/add-count/:id

router.put("/add-count/:id", async (req, res) => {
  try {
    const deal = await Deals.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ msg: "Deal not found" });
    }

    deal.counts++;

    await deal.save();

    return res.status(200).json({ counts: deal.counts });
  } catch (err) {
    console.error(err.message);
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Deal not found" });
    }
    return res.status(500).send("Server Error");
  }
});

//Mark the deal as spam
// @put request
// end point :  /api/deals/mark-spam/:deal_id

router.put("/mark-spam/:deal_id", auth, async (req, res) => {
  const errors = validationResult(req, res);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const deal = await Deals.findById(req.params.deal_id);
    console.log(deal.spamReportBy);

    // Check if deal has been already reported
    if (
      deal.spamReportBy.some(
        (spamReport) => spamReport.user.toString() === req.user.id
      )
    ) {
      return res.status(400).json({
        errors: [
          {
            msg: "Already reported that deal",
          },
        ],
      });
    }

    deal.spamReportBy.unshift({ user: req.user.id });
    deal.totalSpamReports = deal.spamReportBy.length;

    await deal.save();

    return res.json({
      msg: "Your report has been sent to an admin",
      report_by: deal.spamReportBy,
      total_reports: deal.spamReportBy.length,
    });
  } catch (err) {
    console.error(err.message);
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Deal not found" });
    }
    return res.status(500).send("Server Error");
  }
});

// Get All Deals of a specific category
// @get request
// end point : /api/deals/deal-by-category/:category_id

router.get("/deal-by-category/:category_id", async (req, res) => {
  try {
    const dealsByCategory = await Deals.find({
      category_id: req.params.category_id,
      archive: false
    });
    if (dealsByCategory.length === 0) {
      return res
        .status(404)
        .json({ msg: "Deals not found against this category" });
    }
    return res.json({ DealsByCategory: dealsByCategory });
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Category not found" });
    }
    res.status(500).json({ msg: "Server Error" });
  }
});

// post a comment
// @post request
//end point : /api/deals/comment/:deal_id

router.post(
  "/comment/:deal_id",
  auth,
  check("text", "Text is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const deal = await Deals.findById(req.params.deal_id);
      const newComment = {
        user: req.user.id,
        text: req.body.text,
      };

      deal.comments.unshift(newComment);

      await deal.save();

      res.json(deal.comments);
    } catch (error) {
      console.error(error.message);
      if (error.kind == "ObjectId") {
        return res.status(404).json({ msg: "Deal not found" });
      }
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// Delete comment
// @delete request
// end point: api/deals/comment/:id/:comment_id

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const deal = await Deals.findById(req.params.id);

    // Pull out comment
    const comment = deal.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    deal.comments = deal.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await deal.save();

    return res.json(deal.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

// Delete deal
// @delete request
// end point: api/deals/delete_single/:id

router.delete("/delete_single/:deal_id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const deal = await Deals.findById(req.params.deal_id);
    if (!deal) {
      return res.json({ msg: "Deal not found" });
    }
    if (user.isAdmin === true || deal.user_id.toString() === req.user.id || user.role === "admin" || user.role === "employee" || user.role === "standard_user") {
      await deal.remove();
      return res.status(200).json({ msg: "Deal removed successfully" });
    } else {
      return res.json({ msg: "User is not authorized to delete this" });
    }
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res
        .status(404)
        .json({ msg: "Deal not Found", error: error.message });
    }
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

// Add rating
// @post request
// end point: api/deals/add_rating/deal_id

router.post(
  "/add_rating/:deal_id",
  auth,
  [check("rating", "Rating is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const deal = await Deals.findById(req.params.deal_id);
      const dealUser = await User.findById(req.user.id);
      const { rating } = req.body;

      if (deal) {
        const alreadyRated = deal.ratings.find(
          (r) => r.user.toString() === req.user.id.toString()
        );

        if (alreadyRated) {
          return res.status(400).json({ errors: [{ msg: "Already rated" }] });
        }

        const addRating = {
          rating: Number(rating),
          user: req.user.id,
          username: dealUser.username,
        };

        deal.ratings.push(addRating);

        deal.averageRating =
          deal.ratings.reduce((acc, item) => item.rating + acc, 0) /
          deal.ratings.length;

        await deal.save();

        return res.status(201).json({
          message: "Review added",
          ratings: deal.ratings,
          averageRating: deal.averageRating,
        });
      } else {
        return res.status(400).json({ msg: "Deal not found" });
      }
    } catch (error) {
      if (error.kind == "ObjectId") {
        return res
          .status(404)
          .json({ msg: "Deal not Found", error: error.message });
      }
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  }
);

// get military/govt deals
// @get request
// end point: api/deals/military

router.get("/military", async (req, res) => {
  try {
    const { sorted } = req.query;
    if (sorted === "mostRecent") {
      const militaryDeals = await Deals.find({
        category_name: "Military & Veterans",
        disabled: false,
        archive: false
      }).sort({ date: -1 });
      return res.status(200).json({ MilitaryDeals: militaryDeals });
    } else if (sorted === "views") {
      const militaryDeals = await Deals.find({
        category_name: "Military & Veterans",
        disabled: false,
        archive: false
      }).sort({
        counts: -1,
      });
      return res.status(200).json({ MilitaryDeals: militaryDeals });
    } else if (sorted === "likes") {
      const militaryDeals = await Deals.find({
        category_name: "Military & Veterans",
        disabled: false,
        archive: false
      }).sort({
        likes: -1,
      });
      return res.status(200).json({ MilitaryDeals: militaryDeals });
    } else if (sorted === "name") {
      const militaryDeals = await Deals.find({
        category_name: "Military & Veterans",
        disabled: false,
        archive: false
      }).sort({ title: 1 });
      return res.status(200).json({ MilitaryDeals: militaryDeals });
    } else if (sorted === "ascOrder") {
      const militaryDeals = await Deals.find({
        category_name: "Military & Veterans",
        disabled: false,
      });
      return res.status(200).json({ MilitaryDeals: militaryDeals });
    }
    const militaryDeals = await Deals.find({
      category_name: "Military & Veterans",
      disabled: false,
      archive: false
    }).sort({ date: -1 });

    return res.status(200).json({ MilitaryDeals: militaryDeals });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// get coupon deals
// @get request
// end point: api/deals/coupons

router.get("/coupons", async (req, res) => {
  try {
    const { sorted } = req.query;
    if (sorted === "mostRecent") {
      const couponDeals = await Deals.find({
        category_name: "Coupons",
        disabled: false,
      }).sort({ date: -1 });
      return res.status(200).json({ CouponDeals: couponDeals });
    } else if (sorted === "views") {
      const couponDeals = await Deals.find({
        category_name: "Coupons",
        disabled: false,
      }).sort({
        counts: -1,
      });
      return res.status(200).json({ CouponDeals: couponDeals });
    } else if (sorted === "likes") {
      const couponDeals = await Deals.find({
        category_name: "Coupons",
        disabled: false,
      }).sort({
        likes: -1,
      });
      return res.status(200).json({ CouponDeals: couponDeals });
    } else if (sorted === "name") {
      const couponDeals = await Deals.find({
        category_name: "Coupons",
        disabled: false,
      }).sort({ title: 1 });
      return res.status(200).json({ CouponDeals: couponDeals });
    } else if (sorted === "ascOrder") {
      const couponDeals = await Deals.find({
        category_name: "Coupons",
        disabled: false,
      });
      return res.status(200).json({ CouponDeals: couponDeals });
    }
    const couponDeals = await Deals.find({
      category_name: "Coupons",
      disabled: false,
    }).sort({ date: -1 });

    return res.status(200).json({ CouponDeals: couponDeals });
  } catch (error) {
    res.status(500).json({ msg: "Servor error", error: error.message });
  }
});

// get specific user deals
// @get request
// end point: api/deals/user/:user_id

router.get("/user/:user_id", async (req, res) => {
  try {
    const deals = await Deals.find({ user_id: req.params.user_id, archive: false });
    return res.json(deals);
  } catch (error) {
    res.status(500).json({ msg: "Servor error", error: error.message });
  }
});

// get deals based on slug
// @get request
// end point: api/deals/:slug

router.get("/:slug", async (req, res) => {
  try {
    const deal = await Deals.findOne({ slug: req.params.slug, archive: false });
    if (!deal) {
      return res.status(404).json({ msg: " Deal not found" });
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// update  all deals
// @put request
// end point: api/deals/update-all

router.put("/update-all", async (req, res) => {
  try {
    const deals = await Deals.find();

    if (deals.length > 0) {
      for (let index = 0; index < deals.length; index++) {
        try {
          let keywords = makeKeywords(deals[index].title);
          let slug = makeSlug(deals[index].title)
          let deal = await Deals.findOneAndUpdate({ _id: deals[index]._id }, { slug: slug, keywords: keywords });
          console.log(deal)
        } catch (error) {
          console.log(error)
        }
      }
    }

    return res.json(deals)
  } catch (error) {
    console.log(error)
  }
})


// update  all deals for archive
// @put request
// end point: api/deals/archive-all
router.post(
  "/archive-all",
  auth,
  check("deal.*.id").not().isEmpty(),
  check("deal.*.archive").not().isEmpty(),

  async (req, res) => {

    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


    let { deals } = req.body;
    try {
      for (let i = 0; i < deals.length; i++) {
        let deal = await Deals.findById(deals[i].id);
        let user = await User.findById(req.user.id);
        if (user.role === "admin" || user.role === "employee" || user._id === deal.user_id) {
          deal.archive = deals[i].archive;
          await deal.save();
          res.json({ msg: "Updated Successfuly" });
        }
      }
    } catch (error) {
      console.error(error.message);
      if (error.kind == "ObjectId") {
        return res.status(404).json({ msg: "Deal not found" });
      }
      res.status(500).json({ msg: "Server Error" });
    }
  }
);


module.exports = router;
