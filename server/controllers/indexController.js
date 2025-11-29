const passport = require("passport");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require("../db/queries");
const { validateRegister } = require("../utilities/validators");
const {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenCookieOptions,
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
      const { rememberDevice } = req.body;

      const accessToken = generateAccessToken(user.id);
      const refreshToken = await generateRefreshToken(user.id, {
        rememberDevice,
      });

      const cookieOpts = getRefreshTokenCookieOptions({ rememberDevice });

      res.cookie("refreshToken", refreshToken, cookieOpts);

      const sanitizedUser = await db.getUserSanitized(user.id);

      return res.json({
        message: "login was successful",
        user: sanitizedUser,
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
        const AVATAR_URL =
          "https://res.cloudinary.com/dwf29bnr3/image/upload/v1754109878/messaging_app_profile_pics/icsll72wpxwcku6gb1by.jpg";

        const user = await db.createUser(username, hashedPassword, email);
        await db.createProfile(user.id, {
          avatar: AVATAR_URL,
        });

        const accessToken = generateAccessToken(user.id);
        const refreshToken = await generateRefreshToken(user.id);

        const cookieOpts = getRefreshTokenCookieOptions();

        res.cookie("refreshToken", refreshToken, cookieOpts);

        const sanitizedUser = {
          id: user.id,
          username: user.username,
          profile: { avatar: AVATAR_URL },
        };

        return res.json({
          message: "registration was successful",
          user: sanitizedUser,
          accessToken,
        });
      } catch (err) {
        return next(err);
      }
    });
  },
];

module.exports = { loginPost, registerPost };
