const express = require("express");
const Deals = require("../../models/Deals");

const router = express.Router();

/* @des Get All deals on the basis of pagination
   @request Get
   @path /api/pagination/all-deals?searchText=someValue&pageNumber=1&limit=25
*/

router.get("/all-deals", async (req, res) => {
  try {
    const pageLimit = Number(req.query.limit) || 25;
    const page = Number(req.query.pageNumber) || 1;

    const searchText = req.query.searchText
      ? {
          title: {
            $regex: req.query.searchText,
            $options: "i",
          },
        }
      : {};

    const count = await Deals.countDocuments({ ...searchText });
    const deals = await Deals.find({ ...searchText })
      .sort({ date: -1 })
      .limit(pageLimit)
      .skip(pageLimit * (page - 1));

    res.json({ page, pages: Math.ceil(count / pageLimit), deals });
  } catch (error) {
    return res.status(500).json({ msg: "Server Error" });
  }
});

/* @des Get Military deals on the basis of pagination
   @request Get
   @path /api/pagination/military-deals?searchText=someValue&pageNumber=1&limit=25
*/

router.get("/military-deals", async (req, res) => {
  try {
    const pageLimit = Number(req.query.limit) || 25;
    const page = Number(req.query.pageNumber) || 1;

    const searchText = req.query.searchText
      ? {
          title: {
            $regex: req.query.searchText,
            $options: "i",
          },
        }
      : {};

    const count = await Deals.countDocuments({
      ...searchText,
      category_name: "Military & Veterans",
    });
    const militaryDeals = await Deals.find({
      ...searchText,
      category_name: "Military & Veterans",
    })
      .sort({ date: -1 })
      .limit(pageLimit)
      .skip(pageLimit * (page - 1));

    res.json({ page, pages: Math.ceil(count / pageLimit), militaryDeals });
  } catch (error) {
    return res.status(500).json({ msg: "Server Error" });
  }
});

/* @des Get Coupons deals on the basis of pagination
   @request Get
   @path /api/pagination/coupons-deals?searchText=someValue&pageNumber=1&limit=25
*/

router.get("/coupon-deals", async (req, res) => {
    try {
      const pageLimit = Number(req.query.limit) || 25;
      const page = Number(req.query.pageNumber) || 1;
  
      const searchText = req.query.searchText
        ? {
            title: {
              $regex: req.query.searchText,
              $options: "i",
            },
          }
        : {};
  
      const count = await Deals.countDocuments({
        ...searchText,
        category_name: "Coupons",
      });
      const couponDeals = await Deals.find({
        ...searchText,
        category_name: "Coupons",
      })
        .sort({ date: -1 })
        .limit(pageLimit)
        .skip(pageLimit * (page - 1));
  
      res.json({ page, pages: Math.ceil(count / pageLimit), couponDeals });
    } catch (error) {
      return res.status(500).json({ msg: "Server Error" });
    }
  });

  /* @des Get feature deals on the basis of pagination
   @request Get
   @path /api/pagination/feature-deals?searchText=someValue&pageNumber=1&limit=25
*/

router.get("/feature-deals", async (req, res) => {
  try {
    const pageLimit = Number(req.query.limit) || 25;
    const page = Number(req.query.pageNumber) || 1;

    const searchText = req.query.searchText
      ? {
          title: {
            $regex: req.query.searchText,
            $options: "i",
          },
        }
      : {};

    const count = await Deals.countDocuments({
      ...searchText,
      displayOnHome: true,
      disabled: false,
    });
    const featureDeals = await Deals.find({
      ...searchText,
      displayOnHome: true,
      disabled: false,
    })
      .sort({ homeScreenAddDate: -1, })
      .limit(pageLimit)
      .skip(pageLimit * (page - 1));

    res.json({ page, pages: Math.ceil(count / pageLimit), featureDeals });
  } catch (error) {
    return res.status(500).json({ msg: "Server Error" });
  }
});


module.exports = router;
