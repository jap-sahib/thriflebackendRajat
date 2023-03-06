const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    category_name: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      require: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Categories",
    },
    posted_by: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Blog = mongoose.model("blog", blogSchema);
