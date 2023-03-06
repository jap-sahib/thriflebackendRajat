const express = require("express");
const { auth, admin, roleAuth } = require("../../middleware/auth");
const Deals = require("../../models/Deals");
const HomeDeals = require("../../models/Home_deals");
const User = require("../../models/User");
const router = express.Router();

//add deal to home screen
// @put request
// end point :  /api/admin/deals/add_to_home_screen/:id

router.put("/deals/add_to_home_screen/:id", auth, admin, async (req, res) => {
  try {
    const deal = await Deals.findById(req.params.id).select("-counts");

    if (deal.displayOnHome === true) {
      deal.displayOnHome = false;

      await deal.save();
      res.json({ msg: "Deal removed from home screen" });
    } else {
      deal.displayOnHome = true;
      deal.homeScreenAddDate = Date.now();

      await deal.save();
      res.json({ msg: "Deal added to home screen" });
    }
  } catch (error) {
    console.error(error);
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Deal not found" });
    }
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

//display deals on home screen
// @get request
// end point :  /api/admin/deals/home_screen

router.get("/deals/home_screen", async (req, res) => {
  try {
    const { sorted } = req.query;
    if (sorted === "mostRecent") {
      const home_deals = await Deals.find({
        displayOnHome: true,
        disabled: false,
      }).sort({
        homeScreenAddDate: -1,
      });
      res.json(home_deals);
    } else if (sorted === "views") {
      const home_deals = await Deals.find({
        displayOnHome: true,
        disabled: false,
      }).sort({
        counts: -1,
      });
      return res.status(200).json(home_deals);
    } else if (sorted === "likes") {
      const home_deals = await Deals.find({
        displayOnHome: true,
        disabled: false,
      }).sort({
        likes: -1,
      });
      return res.status(200).json(home_deals);
    } else if (sorted === "name") {
      const home_deals = await Deals.find({
        displayOnHome: true,
        disabled: false,
      }).sort({ title: 1 });
      return res.status(200).json(home_deals);
    } else if (sorted === "ascOrder") {
      const home_deals = await Deals.find({
        displayOnHome: true,
        disabled: false,
      });
      return res.status(200).json(home_deals);
    }
    const home_deals = await Deals.find({
      displayOnHome: true,
      disabled: false,
    }).sort({
      homeScreenAddDate: -1,
    });
    res.json(home_deals);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//remove single deal from home screen by using  id of deal
// @put request
// end point :  /api/admin/deals/home_screen/delete_single/:id

router.put(
  "/deals/home_screen/delete_single/:id",
  auth,
  admin,
  async (req, res) => {
    try {
      const deal = await Deals.findById(req.params.id);
      if (!deal) {
        res.status(400).json({ msg: "Deal Not Found" });
      }
      deal.displayOnHome = false;
      await deal.save();
      res.json({ msg: "Deal removed from HomeScreen" });
    } catch (error) {
      console.error(error.message);
      if (error.kind == "ObjectId") {
        return res.status(404).json({ msg: "Deal not found" });
      }
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// //get All pending deals for Approval
// // @get request
// // end point :  /api/admin/deals/pending

// router.get("/deals/pending", auth, admin, async (req, res) => {
//   try {
//     const pendingDeals = await Deals.find({ status: "Pending" });
//     return res.json(pendingDeals);
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ msg: "Server Error" });
//   }
// });

// //Accept All pending deals for Approval
// // @put request
// // end point :  /api/admin/deals/accept-approval/:deal_id

// router.put("/deals/accept-approval/:deal_id", auth, admin, async (req, res) => {
//   try {
//     const pendingDeal = await Deals.findById(req.params.deal_id);
//     if (!pendingDeal) {
//       return res.status(404).json({ msg: "Pending Deal not found" });
//     }
//     pendingDeal.status = "Accepted";
//     await pendingDeal.save();
//     return res.json({ msg: "Deal Approval has been accepted" });
//   } catch (error) {
//     console.log(error.message);
//     if (error.kind == "ObjectId") {
//       return res.status(404).json({ msg: "Deal not found" });
//     }
//     res.status(500).json({ msg: "Server Error" });
//   }
// });

//Get All spam deals reported by users
// @get request
// end point :  /api/admin/deals/reported-deals

router.get("/deals/reported-deals", auth, admin, async (req, res) => {
  try {
    const reportedDeals = await Deals.find({
      status: "Accepted",
      disabled: false,
      totalSpamReports: { $gte: 5 },
    });
    if (reportedDeals.length === 0) {
      return res.status(404).json({ msg: " Reported Deals not found" });
    }
    res.json(reportedDeals);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//Disable reported deal
// @put request
// end point :  /api/admin/deals/reported-deals/disable/:deal_id

router.put(
  "/deals/reported-deals/disable/:deal_id",
  auth,
  admin,
  async (req, res) => {
    try {
      const reportedDeal = await Deals.findById(req.params.deal_id);
      if (!reportedDeal) {
        return res.status(404).json({ msg: "Reported Deal not found" });
      } else if (reportedDeal.totalSpamReports < 5) {
        return res.status(400).json({
          msg: " You need to have atleast five reports to disable this",
        });
      }
      reportedDeal.disabled = true;
      await reportedDeal.save();
      return res.json({ msg: "Spam Deal has been disabled" });
    } catch (error) {
      console.log(error.message);
      if (error.kind == "ObjectId") {
        return res.status(404).json({ msg: "Reported Deal not found" });
      }
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

//Get All disabled deals
// @get request
// end point :  /api/admin/deals/disabled-deals

router.get("/deals/disabled-deals", auth, admin, async (req, res) => {
  try {
    const disabledDeals = await Deals.find({
      status: "Accepted",
      disabled: true,
    });
    if (disabledDeals.length === 0) {
      return res.status(404).json({ msg: " Disabled Deals not found" });
    }
    res.json(disabledDeals);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//Get All Users
// @get request
// end point :  /api/admin/users/get-all

router.get("/users/get-all", auth, admin, async (req, res) => {
  try {
    const { searchText } = req.query;
    if (searchText) {
      var parts = searchText.split(" ");
      var firstName = "";
      var lastName = "";

      if (parts.length > 1) {
        firstName = searchText.split(" ").slice(0, -1).join(" ");
        lastName = searchText.split(" ").slice(-1).join(" ");
      } else {
        firstName = searchText;
        lastName = searchText;
      }
      const users = await User.find({
        $and: [
          {
            $or: [
              {
                firstName: { $regex: firstName, $options: "i" },
              },
              {
                lastName: { $regex: lastName, $options: "i" },
              },
            ],
          },
        ],
      });
      return res.status(200).json(users);
    }
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

//Disable a user
// @put request
// end point :  /api/admin/users/disable/:user_id

router.put("/users/disable/:user_id", auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id);
    if (user.isDisabled === true) {
      user.isDisabled = false;
      await user.save();
      return res.json({ msg: "You just unbanned the user" });
    }
    user.isDisabled = true;
    await user.save();
    return res.json({ msg: "You just banned this user" });
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Deal not found" });
    }
    res.status(500).json({ msg: "Server Error" });
  }
});

//Get All online users
// @get request
// end point :  /api/admin/users/online/get_all

router.get("/users/online/get_all", auth, admin, async (req, res) => {
  try {
    const users = await User.find({ isOnline: true });
    return res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

// add keywords to deals
// @put
// end point: api/admin/add-keyword/:id

router.put("/add-keyword/:id", auth, roleAuth, async (req, res) => {
  try {
    const { keyword } = req.body;
    const deal = await Deals.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ msg: " Deal not found" });
    }

    deal.keywords.unshift(keyword);

    await deal.save();

    res.json(deal);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// assign a role to user
// @put request
// end point :  /api/admin/assign-role/:user_id

router.put("/assign-role/:user_id", auth, admin, async (req, res) => {
  try {
    const { role } = req.body;
    let user = await User.findById(req.params.user_id);

    console.log("User is", user);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    } else if (
      role == "admin" ||
      role == "super_user" ||
      role == "standard_user" ||
      role == "employee"
    ) {
      user.role = role;
      await user.save();

      return res
        .status(200)
        .json({ msg: "User has been assigned a role", user });
    } else {
      return res.status(400).json({
        msg:
          "User roles should be,  admin | super_user | standard_user | employee ",
      });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
});

// assign a role to user
// @put request
// end point :  /api/admin/delete-user-account

router.delete("/delete-user-account", auth, admin, async (req, res) => {
  try {
    const { users } = req.body;
    const deleteUsersRes = await User.deleteMany({
      _id: { $in: users },
    });
    return res.status(200).json({
      message: "Users within id has been deleted",
      response: deleteUsersRes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
