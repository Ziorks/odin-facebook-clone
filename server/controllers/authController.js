require("dotenv").config();
const passport = require("passport");
const db = require("../db/queries");
const {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenCookieOptions,
  getTokenRecord,
} = require("../utilities/helperFunctions");

const tokenExchangePost = async (req, res, next) => {
  const { oauthToken } = req.body;
  if (!oauthToken) {
    return res.status(400).json({ message: "oauthToken is required" });
  }

  try {
    const user = await db.getUserByOauthToken(oauthToken);
    if (!user) {
      return res.status(401).json({ message: "invalid oauth token" });
    }

    await db.deleteOauthToken(oauthToken);
    const rememberDevice = true;

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
  } catch (err) {
    return next(err);
  }
};

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
  const { rememberDevice } = tokenRecord;

  await db.updateRefreshToken(tokenRecord.id, { revoked: true });

  const newAccessToken = generateAccessToken(tokenRecord.userId);
  const newRefreshToken = await generateRefreshToken(tokenRecord.userId, {
    rememberDevice,
  });

  const cookieOpts = getRefreshTokenCookieOptions({ rememberDevice });

  const sanitizedUser = await db.getUserSanitized(+refreshToken.split(".")[0]);

  res.cookie("refreshToken", newRefreshToken, cookieOpts);

  return res.json({
    user: sanitizedUser,
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
  const { rememberDevice } = tokenRecord;

  await db.updateRefreshToken(tokenRecord.id, { revoked: true });

  const cookieOpts = getRefreshTokenCookieOptions({ rememberDevice });
  res.clearCookie("refreshToken", cookieOpts);

  return res.json({ message: "logged out successfully" });
};

const guestLoginGet = async (req, res, next) => {
  const DEMO_ACCOUNT_USERNAME = "Demo_User";
  const AVATAR_URL =
    "https://res.cloudinary.com/dwf29bnr3/image/upload/v1754109878/messaging_app_profile_pics/icsll72wpxwcku6gb1by.jpg";

  try {
    let user = await db.getUserByUsername(DEMO_ACCOUNT_USERNAME);
    if (!user) {
      user = await db.createUser(DEMO_ACCOUNT_USERNAME, undefined, undefined, {
        firstname: "Demo",
        lastname: "User",
        avatar: AVATAR_URL,
      });
    }
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
      message: "guest user login successful",
      user: sanitizedUser,
      accessToken,
    });
  } catch (err) {
    return next(err);
  }
};

const googleOauthGet = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

const googleCallbackGet = [
  passport.authenticate("google", {
    session: false,
    failureRedirect: process.env.CLIENT_ORIGIN,
  }),
  async (req, res, next) => {
    const { user } = req;

    try {
      const token = await db.createOauthToken(user.id);
      return res.redirect(
        `${process.env.CLIENT_ORIGIN}/oauth?token=${token.id}`
      );
    } catch (error) {
      return next(error);
    }
  },
];

const githubOauthGet = passport.authenticate("github", {
  scope: ["user:email"],
  session: false,
});

const githubCallbackGet = [
  passport.authenticate("github", {
    session: false,
    failureRedirect: process.env.CLIENT_ORIGIN,
  }),
  async (req, res, next) => {
    const { user } = req;

    try {
      const token = await db.createOauthToken(user.id);
      return res.redirect(
        `${process.env.CLIENT_ORIGIN}/oauth?token=${token.id}`
      );
    } catch (error) {
      return next(error);
    }
  },
];

module.exports = {
  tokenExchangePost,
  refreshPost,
  logoutPost,
  guestLoginGet,
  googleOauthGet,
  googleCallbackGet,
  githubOauthGet,
  githubCallbackGet,
};
