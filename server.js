const express = require("express");
const colors = require("colors");
const connectDB = require("./config/db");
const users = require("./routes/api/users");
const auth = require("./routes/api/auth");
const category = require("./routes/api/category");
const deal = require("./routes/api/deal");
const admin = require("./routes/api/admin");
const cors = require("cors");
const uploadImages = require("./routes/api/upload-image");
const scraping = require("./routes/api/image-scrapper");
const contact = require("./routes/api/contact");
const logo = require("./routes/api/logo");
const blog = require("./routes/api/blog");
const pagination = require("./routes/api/pagination");

require("dotenv").config();

const app = express();

//Database connection execution
//connectDB();

//body Parser

app.use(express.json({ extended: true }));

app.use(cors()); //cors policy

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//public folder
app.use(express.static("public"));
app.use("/public", express.static(__dirname + "/public"));
app.use(express.raw());
//main route

app.get("/", (req, res) => {
  res.json({ msg: "Api is running" });
});
//other routes

app.use("/api/users", users); // registration route
app.use("/api/auth", auth); //auth route
app.use("/api/category", category); //category route
app.use("/api/deals", deal); //deals route
app.use("/api/admin", admin); //admin route
app.use("/api/images", uploadImages); // upload images
app.use("/api/scrap", scraping);
app.use("/api/contact_us", contact); // contact us
app.use("/api/web", logo); //web logo
app.use("/api/blog/posts", blog); //blog
app.use("/api/pagination", pagination); //pagination

//define a Port

const PORT = process.env.PORT || 8000;

//run a server on defined PORT

app.listen(PORT, () =>
  console.log(`Server is listening on PORT ${PORT}`.cyan.inverse.bold)
);
