const passport = require("passport");
const db = require("../db/queries");
const { configureLikedByObject } = require("../utilities/helperFunctions");

const notFoundHandler = (req, res) => {
  return res.sendStatus(404);
};

const errorHandler = (error, req, res, next) => {
  console.error(error);
  return res.status(500).json({
    message: "an error occured on the server",
    error,
  });
};

const jwtAuth = passport.authenticate("jwt", { session: false });

const getPost = async (req, res, next) => {
  const { postId } = req.params;

  const post = await db.getPost(+postId);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  configureLikedByObject(post, req.user.id);
  post.comments.forEach((comment) => {
    configureLikedByObject(comment, req.user.id);
  });

  req.post = post;
  return next();
};

const postEditAuth = (req, res, next) => {
  const userId = req.user.id;
  const authorId = req.post.author.id;

  if (userId !== authorId) {
    return res
      .status(403)
      .json({ message: "you are not authorized to edit this post" });
  }

  return next();
};

const getComment = async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await db.getComment(+commentId);
  if (!comment) {
    return res.status(404).json({ message: "comment not found" });
  }

  req.comment = comment;
  return next();
};

const commentEditAuth = async (req, res, next) => {
  const userId = req.user.id;
  const authorId = req.comment.author.id;

  if (userId !== authorId) {
    return res
      .status(403)
      .json({ message: "you are not authorized to edit this comment" });
  }

  return next();
};

module.exports = {
  notFoundHandler,
  errorHandler,
  jwtAuth,
  getPost,
  postEditAuth,
  getComment,
  commentEditAuth,
};
