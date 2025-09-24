const passport = require("passport");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require("../db/queries");
const { validateRegister } = require("../utilities/validators");
const {
  generateAccessToken,
  generateRefreshToken,
  getTokenRecord,
  sanitizeUser,
} = require("../utilities/helperFunctions");

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 1000 * 60 * 60 * 24 * 7, //7 days
};

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

      const accessToken = generateAccessToken(user.id);
      const refreshToken = await generateRefreshToken(user.id);

      res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

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

        const accessToken = generateAccessToken(user.id);
        const refreshToken = await generateRefreshToken(user.id);

        res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

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

const refreshPost = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(400).json({ message: "missing refresh token" });
  }

  const tokenRecord = await getTokenRecord(refreshToken);
  if (!tokenRecord) {
    return res.status(403).json({
      message: "invalid or expired refresh token",
    });
  }

  await db.updateRefreshToken(tokenRecord.id, { revoked: true });

  const newAccessToken = generateAccessToken(tokenRecord.userId);
  const newRefreshToken = await generateRefreshToken(tokenRecord.userId);

  const user = await db.getUserById(+refreshToken.split(".")[0]);

  res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  return res.json({
    user: sanitizeUser(user),
    accessToken: newAccessToken,
  });
};

const logoutPost = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(400).json({ message: "missing refresh token" });
  }

  const tokenRecord = await getTokenRecord(refreshToken);
  if (!tokenRecord) {
    return res.status(403).json({
      message: "invalid or expired refresh token",
    });
  }

  await db.updateRefreshToken(tokenRecord.id, { revoked: true });

  res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);

  return res.json({ message: "logged out successfully" });
};

module.exports = { loginPost, registerPost, refreshPost, logoutPost };
