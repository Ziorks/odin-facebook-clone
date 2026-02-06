require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { extractPublicId } = require("cloudinary-build-url");
const cloudinary = require("../utilities/cloudinary");
const {
  POST_UPLOAD_FOLDER,
  COMMENT_UPLOAD_FOLDER,
} = require("../utilities/constants");
const db = require("../db/queries");

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY_TIME = 1000 * 60 * 60 * 24 * 7; //7 days

function generateAccessToken(userId) {
  return jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: "15m" });
}

async function generateRefreshToken(userId, { rememberDevice = false } = {}) {
  const rawToken = crypto.randomBytes(40).toString("hex");
  const combinedToken = `${userId}.${rawToken}`;
  const hashedToken = await bcrypt.hash(rawToken, 10);

  await db.createRefreshToken(
    hashedToken,
    userId,
    rememberDevice,
    new Date(Date.now() + REFRESH_TOKEN_EXPIRY_TIME),
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

const getRefreshTokenCookieOptions = ({ rememberDevice = false } = {}) => {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: rememberDevice ? REFRESH_TOKEN_EXPIRY_TIME : undefined,
  };
};

async function formatComment(comment, userId) {
  const myLike = await db.getLikeByUserAndTarget(userId, comment.id, "COMMENT");
  comment.myLike = myLike || null;
  if (comment.isDeleted) {
    comment.content = "[deleted comment]";
    comment.mediaUrl = null;
  }
}

async function attachMyLikesToPost(post, userId) {
  const [postLike] = await Promise.all([
    db.getLikeByUserAndTarget(userId, post.id, "POST"),
    post.topComment
      ? formatComment(post.topComment, userId)
      : Promise.resolve(),
    post.topComment?.reply
      ? formatComment(post.topComment.reply, userId)
      : Promise.resolve(),
  ]);

  post.myLike = postLike || null;
}

const getRandomNumber = (start, end) => {
  return Math.floor(start + (end - start + 1) * Math.random());
};

async function getAuthObject(userId) {
  const accessToken = generateAccessToken(userId);
  const [sanitizedUser, nIncomingFriendRequests] = await Promise.all([
    db.getUserSanitized(userId),
    db.getUsersIncomingFriendRequestsCount(userId),
  ]);

  return {
    accessToken,
    user: sanitizedUser,
    count: {
      incomingFriendRequests: nIncomingFriendRequests,
    },
  };
}

async function deleteFromCloudinary(url, cloudinaryFolderName) {
  if (!url || !cloudinaryFolderName) return;

  const publicId = extractPublicId(url);
  if (publicId.split("/")[0] !== cloudinaryFolderName) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(
      `Cloudinary file with public id: '${publicId}' not deleted. You will need to delete it manually.`,
      err,
    );
    throw new Error(err);
  }
}

async function deleteUploadedFilesFromPost(post) {
  //destroy media on post
  if (post.type === "REGULAR") {
    await deleteFromCloudinary(post.mediaUrl, POST_UPLOAD_FOLDER);
  }

  const mediaUrls = [];

  //loop through each depth of comments/replies accumulating mediaUrls
  let comments = [];
  if (post._count.comments > 0) {
    const initialComments = await db.getPostComments(post.id);
    comments.push(...initialComments.results);
  }

  while (comments.length > 0) {
    const commentIdsWithReplies = [];

    comments.forEach((comment) => {
      if (comment._count.replies > 0) {
        commentIdsWithReplies.push(comment.id);
      }
      if (comment.mediaUrl) {
        mediaUrls.push(comment.mediaUrl);
      }
    });

    const nextComments = [];
    await Promise.all(
      commentIdsWithReplies.map(async (id) => {
        try {
          const replies = await db.getCommentReplies(id);
          nextComments.push(...replies.results);
        } catch (err) {
          console.error(
            `an error occured getting replies for comment with id:${id} in function 'deleteUploadedFilesFromPost'`,
            err,
          );
          return;
        }
      }),
    );

    comments = nextComments;
  }

  //destroy all accumulated mediaUrls
  await Promise.all(
    mediaUrls.map(async (url) => {
      try {
        await deleteFromCloudinary(url, COMMENT_UPLOAD_FOLDER);
      } catch (err) {
        return;
      }
    }),
  );
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  getTokenRecord,
  getRefreshTokenCookieOptions,
  formatComment,
  attachMyLikesToPost,
  getRandomNumber,
  getAuthObject,
  deleteFromCloudinary,
  deleteUploadedFilesFromPost,
};
