const express = require("express");
const { auth, admin } = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const Categories = require("../../models/Categories");
const User = require("../../models/User");
const Blog = require("../../models/Blog");
const router = express.Router();

//create  post
// @post request
// end point :  /api/blog/posts/create

router.post(
  "/create",
  [
    auth,
    [
      check("title", "Title of post is required").not().isEmpty(),
      check("description", "Description of post is required").not().isEmpty(),
      check("category_name", "Category Name is required").not().isEmpty(),
      check("thumbnail", "Thumbnail is required").not().isEmpty(),
      check("content", "Content is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req, res);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);

    let { title, description, category_name, thumbnail, content } = req.body;

    try {
      let category = await Categories.findOne({ name: category_name });
      let user = await User.findById(req.user.id);
      if (category) {
        const newPost = new Blog({
          user_id: req.user.id,
          category_id: category._id,
          title,
          description,
          content,
          category_name: category.name,
          thumbnail,
          posted_by: user.isAdmin
            ? "Admin"
            : user.firstName + " " + user.lastName,
        });
        await newPost.save();
        return res.json({
          msg: " Your Post has been posted",
          Post: newPost,
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

//Get All Blog posts
// @get request
// end point :  /api/blog/posts/get-all

router.get("/get-all", async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const searchText = req.query.searchText
      ? {
          title: {
            $regex: req.query.searchText,
            $options: "i",
          },
        }
      : {};

    const count = await Blog.countDocuments({ ...searchText });
    const posts = await Blog.find({ ...searchText })
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ page, pages: Math.ceil(count / pageSize), posts });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

//Get Single Post
// @get request
// end point :  /api/blog/posts/:post_id

router.get("/:post_id", async (req, res) => {
  try {
    const post = await Blog.findById(req.params.post_id);
    res.json(post);
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

//Get related posts
// @get request
// end point :  /api/blog/posts/category/:category_name

router.get("/category/:category_name", async (req, res) => {
  try {
    const posts = await Blog.find({
      category_name: req.params.category_name,
    }).limit(4);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

//Edit Single Post
// @put request
// end point :  /api/blog/posts/edit/:post_id

router.put("/edit/:post_id", async (req, res) => {
  try {
    let { title, description, category_name, thumbnail, content } = req.body;
    const post = await Blog.findById(req.params.post_id);
    let category = await Categories.findOne({ name: category_name });
    if (!post) {
      return res.status(404).json({ err: "Post not found against this id" });
    }
    post.title = title;
    post.description = description;
    post.category_name = category_name;
    post.category_id = category._id;
    post.thumbnail = thumbnail;
    post.content = content;
    await post.save();
    return res.json({ msg: "Your Post has been updated successfully" });
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

//delete Single Post
// @delete request
// end point :  /api/blog/posts/delete/:post_id

router.delete("/delete/:post_id", auth, admin, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.post_id);
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
    }
    await post.remove();
    return res.json("Post has been removed successfully");
  } catch (error) {
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});
module.exports = router;
