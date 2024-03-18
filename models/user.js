const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    maxlength: 1024,
    minlength: 5,
  },
  userType: {
    type: String,
    enum: ['collegeS', 'collegeG'],
    required: true, // User type is required during registration
  },
  AcademicOpinion: {
    type: String,
  },
  NonAcademicOpinion: {
    type: String,
  },
  PlacementOpinion: {
    type: String,
  },
  OverallOpinion: {
    type: String,
  },
  college: {
    type: String,
  },
  branch: {
    type: String,
  },
  year: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
  return token;
};

// for registering validation
// function validateUser(user) {
//   const schema = Joi.object({
//     name: Joi.string().required().min(5).max(50),
//     username: Joi.string().required().min(3).max(50),
//     email: Joi.string().required().min(5).max(255).email(),
//     password: Joi.string().required().min(5).max(1024),
//     userType: Joi.string().valid("collegeS", "collegeG").required(),
//     college: Joi.when("userType", { is: "collegeG", then: Joi.string().required() }),
//     branch: Joi.when("userType", { is: "collegeG", then: Joi.string().required() }),
//     year: Joi.when("userType", { is: "collegeG", then: Joi.string().required() }),
//   });
//   return schema.validate(user);
// };

// for login validation
// function validates(user) {
//   const schema = Joi.object({
//     email: Joi.string().min(5).max(255).required().email(),
//     password: Joi.string().min(5).max(1024).required(),
//   });
//   return schema.validate(user);
// }

exports.User = User;
// exports.validates = validates;
// exports.validateUser = validateUser;
