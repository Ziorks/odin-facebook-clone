const { validationResult } = require("express-validator");
const db = require("../db/queries");
const { getComment, commentEditAuth } = require("../middleware");
const {
  validateCommentCreate,
  validateCommentEdit,
} = require("../utilities/validators");
const { configureLikedByObject } = require("../utilities/helperFunctions");

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

    const isPostIdValid = await db.getPost(postId);
    if (!isPostIdValid) {
      return res.status(400).json({
        message: "validation failed",
        errors: [
          {
            type: "field",
            value: postId,
            msg: "postId is not a valid post id",
            path: "postId",
            location: "body",
          },
        ],
      });
    }

    if (parentId) {
      const isParentIdValid = await db.getComment(parentId);
      if (!isParentIdValid) {
        return res.status(400).json({
          message: "validation failed",
          errors: [
            {
              type: "field",
              value: parentId,
              msg: "parentId is not a valid comment id",
              path: "parentId",
              location: "body",
            },
          ],
        });
      }
    }

    const comment = await db.createComment(authorId, postId, content, parentId);
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
    await db.updateComment(req.comment.id, { content });

    return res.json({ message: "comment edited" });
  },
];

const commentRepliesGet = [
  getComment,
  async (req, res) => {
    const replies = await db.getCommentReplies(req.comment.id);

    replies.forEach((reply) => {
      configureLikedByObject(reply, req.user.id);
    });

    return res.json({ replies });
  },
];

const commentDeletePut = [
  getComment,
  commentEditAuth,
  async (req, res) => {
    //Soft delete a comment
    await db.softDeleteComment(req.comment.id);

    return res.json({ message: "comment deleted" });
  },
];

module.exports = {
  commentPost,
  commentEditPut,
  commentRepliesGet,
  commentDeletePut,
};
