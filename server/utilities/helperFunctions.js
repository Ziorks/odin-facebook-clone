require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/queries");

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY_TIME = 1000 * 60 * 60 * 24 * 7; //7 days

function generateAccessToken(userId) {
  return jwt.sign({ sub: userId }, ACCESS_SECRET, {
    expiresIn: "15m",
  });
}

async function generateRefreshToken(userId, rememberMe = false) {
  const rawToken = crypto.randomBytes(40).toString("hex");
  const combinedToken = `${userId}.${rawToken}`;
  const hashedToken = await bcrypt.hash(rawToken, 10);

  await db.createRefreshToken(
    hashedToken,
    userId,
    rememberMe,
    new Date(Date.now() + REFRESH_TOKEN_EXPIRY_TIME)
  );

  return combinedToken;
}

async function getTokenRecord(token) {
  if (!token.includes(".")) {
    return false;
  }
  const [userId, rawToken] = token.split(".");

  const tokenRecords = await db.getValidRefreshTokensByUserId(+userId);

  for (const record of tokenRecords) {
    const match = await bcrypt.compare(rawToken, record.token);
    if (match) {
      return record;
    }
  }

  return null;
}

const getRefreshTokenCookieOptions = (rememberDevice = false) => {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: rememberDevice ? 1000 * 60 * 60 * 24 * 7 : undefined, //7 days
  };
};

function sanitizeUser(user) {
  const { id, username } = user;
  return { id, username };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  getTokenRecord,
  getRefreshTokenCookieOptions,
  sanitizeUser,
};
