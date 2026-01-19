const { validationResult } = require("express-validator");
const db = require("../db/queries");
const { getComment, commentEditAuth } = require("../middleware");
const { formatComment } = require("../utilities/helperFunctions");
const {
  validateCommentCreate,
  validateCommentEdit,
} = require("../utilities/validators");

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
    formatComment(comment, req.user.id);

    return res.json({ message: "comment created", comment });
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

    formatComment(comment, req.user.id);

    return res.json({ message: "comment edited", comment });
  },
];

const commentRepliesGet = [
  getComment,
  async (req, res) => {
    const replies = await db.getCommentReplies(req.comment.id);

    replies.forEach((reply) => {
      formatComment(reply, req.user.id);
    });

    return res.json({ replies });
  },
];

const commentDeletePut = [
  getComment,
  commentEditAuth,
  async (req, res) => {
    //Soft delete a comment
    const comment = await db.softDeleteComment(req.comment.id);
    formatComment(comment, req.user.id);

    return res.json({ message: "comment deleted", comment });
  },
];

module.exports = {
  commentPost,
  commentEditPut,
  commentRepliesGet,
  commentDeletePut,
};
