require("dotenv").config();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require("../db/queries");
const { validateRegister } = require("../utilities/validators");

function generateToken(userId) {
  return `Bearer ${jwt.sign({ sub: userId }, process.env.JWT_SECRET)}`;
}

const loginPost = (req, res, next) => {
  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(400).json({ message: info.message });
    }

    const token = generateToken(user.id);
    return res.json({ message: "login was successful", user, token });
  })(req, res, next);
};

const registerPost = [
  validateRegister,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = await db.getUserByUsername(username);
    if (user) {
      return res.status(400).json({
        message: "validation failed",
        errors: [
          {
            type: "field",
            value: username,
            msg: "Username is taken",
            path: "username",
            location: "body",
          },
        ],
      });
    }

    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      try {
        const user = await db.createUser(username, hashedPassword);
        const token = generateToken(user.id);
        return res.json({
          message: "registration was successful",
          user,
          token,
        });
      } catch (err) {
        return next(err);
      }
    });
  },
];

module.exports = { loginPost, registerPost };
