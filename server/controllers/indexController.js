const passport = require("passport");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require("../db/queries");
const { validateRegister } = require("../utilities/validators");
const {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenCookieOptions,
  sanitizeUser,
} = require("../utilities/helperFunctions");

const loginPost = (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    async (error, user, info) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        return res.status(400).json({ message: info.message });
      }
      const { rememberMe } = req.body;

      const accessToken = generateAccessToken(user.id);
      const refreshToken = await generateRefreshToken(user.id, rememberMe);

      const cookieOpts = getRefreshTokenCookieOptions(rememberMe);

      res.cookie("refreshToken", refreshToken, cookieOpts);

      return res.json({
        message: "login was successful",
        user: sanitizeUser(user),
        accessToken,
      });
    }
  )(req, res, next);
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

    const { username, password, email } = req.body;

    const usernameTaken = await db.getUserByUsername(username);
    if (usernameTaken) {
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

    const emailTaken = await db.getUserByEmail(email);
    if (emailTaken) {
      return res.status(400).json({
        message: "validation failed",
        errors: [
          {
            type: "field",
            value: email,
            msg: "Email is already in use",
            path: "email",
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
        const user = await db.createUser(username, hashedPassword, email);

        const accessToken = generateAccessToken(user.id);
        const refreshToken = await generateRefreshToken(user.id);

        const cookieOpts = getRefreshTokenCookieOptions();

        res.cookie("refreshToken", refreshToken, cookieOpts);

        return res.json({
          message: "registration was successful",
          user: sanitizeUser(user),
          accessToken,
        });
      } catch (err) {
        return next(err);
      }
    });
  },
];

module.exports = { loginPost, registerPost };
