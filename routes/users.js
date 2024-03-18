const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("config");
const _ = require("lodash");
const Joi = require("joi");
const { User, validates, validateUser } = require("../models/user");
const College = require("../models/college");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/admin");
const { valid } = require("joi");
const router = express.Router();

router.post("/register", async (req, res) => {
  // const { error } = validateUser(req.body);
  // if (error) return res.status(400).send(error.details[0].message);
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");
  user = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: await bcrypt.hash(req.body.password, 10),
    userType: req.body.userType,
    college: req.body.college,
    branch: req.body.branch,
    year: req.body.year,
    AcademicOpinion: req.body.AcademicOpinion,
    NonAcademicOpinion: req.body.NonAcademicOpinion,
    PlacementOpinion: req.body.PlacementOpinion,
    OverallOpinion: req.body.OverallOpinion,
  });
  try {
    await user.save();
    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.jwtPrivateKey
    );
    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(_.pick(user, ["_id", "name", "email", "userType", "college", "branch"]));
  } catch (err) {
    console.log("error: ", err);
  }
});

router.get('/search', async (req, res) => {
  const { college, branch } = req.query;
  try {
    // Find students based on college and branch
    const students = await User.find({ userType: "collegeG", college: college, branch: branch });
    res.json(students);
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/compare', async (req, res) => {
  const { college1, college2 } = req.query;

  try {
    const [college1Data, college2Data] = await Promise.all([
      College.findOne({ name: college1 }),
      College.findOne({ name: college2 }),
    ]);

    const data = {
      college1: college1Data || {},
      college2: college2Data || {},
    };

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching college data' });
  }
});

router.get('/opinion', async (req, res) => {
  const { college1, college2, branch1, branch2 } = req.query;
  try {
    const [user1Data, user2Data] = await Promise.all([
      User.find({ userType: "collegeG", college: college1, branch: branch1 }),
      User.find({ userType: "collegeG", college: college2, branch: branch2 }),
    ]);

    const data = {
      user1: user1Data || [],
      user2: user2Data || [],
    };

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error Fetching User Opinions' });
  }
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.send("this user does'nt exists in the database!");
  res.send(user);
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) return res.send("this user does'nt exists in the database!");
  res.send(user);
});

router.post("/login", async (req, res) => {
  // const { error } = validates(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  if (req.user) return res.send("User already logged in!");
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validpassword = await bcrypt.compare(req.body.password, user.password);
  if (!validpassword) return res.status(400).send("invalid email or password");

  const token = jwt.sign(
    { _id: user._id, isAdmin: user.isAdmin },
    process.env.jwtPrivateKey
  );
  res.header("x-auth-token").send(token);
});



router.post("/logout", async (req, res) => { });
module.exports = router;
