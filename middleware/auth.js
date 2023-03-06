const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  //check if token is present

  if (!token) {
    return res.status(401).json({ msg: "Not authorized" });
  }

  //verify token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

//Admin Verification
const admin = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (req.user && user.isAdmin && user.role === "admin") {
    next();
  } else {
    res.status(401).json({ msg: "Not authorized as an admin" });
  }
};

const roleAuth = async (req, res, next) => {
  console.log('req is', req.user)
  const user = await User.findById(req.user.id);
  if ( user.role === "admin" || user.role === "employee") {
    next();
  } else {
    res.status(401).json({ msg: "Not authorized as an admin or employee" });
  }
};

module.exports = { auth, admin, roleAuth };
