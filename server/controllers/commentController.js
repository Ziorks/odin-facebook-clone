const { validationResult } = require("express-validator");
const db = require("../db/queries");
const {
  getComment,
  commentEditAuth,
  getPaginationQuery,
} = require("../middleware");
const {
  validateCommentCreate,
  validateCommentEdit,
} = require("../utilities/validators");
const { formatComment } = require("../utilities/helperFunctions");

const commentPost = [
  validateCommentCreate,
  async (req, res) => {
    //Create a comment
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const authorId = req.user.id;
    const { postId, content, parentId } = req.body;

    const comment = await db.createComment(authorId, postId, content, parentId);
    await formatComment(comment, req.user.id);

    return res.json({ message: "comment created", comment });
  },
];

const commentGet = [
  getComment,
  (req, res) => {
    return res.json({ comment: req.comment });
  },
];

const commentEditPut = [
  getComment,
  commentEditAuth,
  validateCommentEdit,
  async (req, res) => {
    //Edit a comment
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const { content } = req.body;
    const comment = await db.updateComment(req.comment.id, { content });
    await formatComment(comment, req.user.id);

    return res.json({ message: "comment edited", comment });
  },
];

const commentRepliesGet = [
  getComment,
  getPaginationQuery,
  async (req, res) => {
    const { comment } = req;
    const { page, resultsPerPage } = req.pagination;

    const replies = await db.getCommentReplies(comment.id, {
      page,
      resultsPerPage,
    });
    await Promise.all(
      replies.results.map(async (reply) => {
        formatComment(reply, req.user.id);
      }),
    );

    return res.json(replies);
  },
];

const commentDeletePut = [
  getComment,
  commentEditAuth,
  async (req, res) => {
    //Soft delete a comment
    const comment = await db.softDeleteComment(req.comment.id);
    await formatComment(comment, req.user.id);

    return res.json({ message: "comment deleted", comment });
  },
];

const commentLikePost = [
  getComment,
  async (req, res) => {
    const { comment } = req;

    if (comment.myLike) {
      return res
        .status(400)
        .json({ message: "you have already liked this comment" });
    }
    if (comment.isDeleted) {
      return res
        .status(400)
        .json({ message: "you can not like a deleted comment" });
    }

    const like = await db.createLike(req.user.id, comment.id, "COMMENT");

    return res.json({ message: "comment like created", like });
  },
];

const commentLikesGet = [
  getComment,
  getPaginationQuery,
  async (req, res) => {
    const { page, resultsPerPage } = req.pagination;

    const likes = await db.getCommentLikes(req.comment.id, {
      page,
      resultsPerPage,
    });

    return res.json(likes);
  },
];

module.exports = {
  commentPost,
  commentGet,
  commentEditPut,
  commentRepliesGet,
  commentDeletePut,
  commentLikePost,
  commentLikesGet,
};
