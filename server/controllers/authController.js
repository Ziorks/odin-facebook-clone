require("dotenv").config();
const passport = require("passport");
const db = require("../db/queries");
const {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenCookieOptions,
  getTokenRecord,
  sanitizeUser,
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
    const rememberMe = true;

    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id, rememberMe);

    const cookieOpts = getRefreshTokenCookieOptions(rememberMe);

    res.cookie("refreshToken", refreshToken, cookieOpts);

    return res.json({
      message: "login was successful",
      user: sanitizeUser(user),
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

  await db.updateRefreshToken(tokenRecord.id, { revoked: true });

  const newAccessToken = generateAccessToken(tokenRecord.userId);
  const newRefreshToken = await generateRefreshToken(
    tokenRecord.userId,
    tokenRecord.rememberDevice
  );

  const cookieOpts = getRefreshTokenCookieOptions(tokenRecord.rememberDevice);

  const user = await db.getUserById(+refreshToken.split(".")[0]);

  res.cookie("refreshToken", newRefreshToken, cookieOpts);

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

  const cookieOpts = getRefreshTokenCookieOptions(tokenRecord.rememberDevice);

  res.clearCookie("refreshToken", cookieOpts);

  return res.json({ message: "logged out successfully" });
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
  googleOauthGet,
  googleCallbackGet,
  githubOauthGet,
  githubCallbackGet,
};
