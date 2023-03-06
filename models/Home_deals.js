const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const home_dealSchema = new Schema({
  deal_id: {
    type: Schema.Types.ObjectId,
    ref: "deals",
  },
  title: {
    type: String,
  },
  price: {
    type: String,
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
  },
  description: {
    type: String,
  },
  image_links: {
    type: [String],
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  counts: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = HomeDeals = mongoose.model("homedeal", home_dealSchema);
