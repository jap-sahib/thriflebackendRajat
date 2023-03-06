const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dealSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Schema.Types.Mixed,
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "categories",
  },
  category_name: {
    type: String,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  link: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [
    {
      imageUrl: {
        type: String,
        required: true,
      },
    },
  ],
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  posted_by: {
    type: String,
  },
  counts: {
    type: Number,
    default: 0,
  },
  displayOnHome: {
    type: Boolean,
    default: false,
  },
  // status: {
  //   type: String,
  //   default: "Pending",
  // },
  disabled: {
    type: Boolean,
    default: false,
  },
  spamReportBy: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
      name: {
        type: String,
        default: "Anonymous",
      },
      text: {
        type: String,
      },
    },
  ],
  totalSpamReports: {
    type: Number,
    default: 0,
  },
  ratings: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        default: 0,
        required: true,
      },
    },
  ],
  averageRating: {
    type: Number,
    default: 0,
  },
  slug: {
    type: String,
  },
  keywords:[String],
  date: {
    type: Date,
    default: Date.now,
  },
  homeScreenAddDate: {
    type: Date,
  },
  archive: {
    type: Boolean,
    default: false,
  },
});

module.exports = Deals = mongoose.model("deal", dealSchema);
