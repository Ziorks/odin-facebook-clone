const { validationResult } = require("express-validator");
const cloudinary = require("../utilities/cloudinary");
const { extractPublicId } = require("cloudinary-build-url");
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

const UPLOADS_FOLDER = "facebook_clone_comment_pics";

const commentPost = [
  validateCommentCreate,
  async (req, res, next) => {
    //Create a comment
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    //if picture was sent => upload to cloudinary
    if (req.file) {
      const { buffer, mimetype } = req.file;
      const b64 = Buffer.from(buffer).toString("base64");
      const dataURI = "data:" + mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: UPLOADS_FOLDER,
      });
      req.body.imageUrl = result.secure_url;
      req.body.imagePublicId = result.public_id;
    }

    const authorId = req.user.id;
    const { postId, content, parentId, imageUrl, imagePublicId } = req.body;

    try {
      const comment = await db.createComment(
        authorId,
        postId,
        content,
        imageUrl,
        parentId,
      );
      await formatComment(comment, req.user.id);

      return res.json({ message: "comment created", comment });
    } catch (err) {
      //delete new pic if user update fails
      if (imagePublicId) {
        try {
          await cloudinary.uploader.destroy(imagePublicId);
        } catch (err) {
          console.error(
            `Cloudinary file with public id: '${imagePublicId}' not deleted. You will need to delete it manually.`,
          );
          return next(err);
        }
      }

      return next(err);
    }
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
  async (req, res, next) => {
    //Edit a comment
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const oldMediaUrl = req.comment.mediaUrl;
    const { content, imageUrl } = req.body;

    const comment = await db.updateComment(req.comment.id, {
      content: content ?? null,
      mediaUrl: imageUrl ?? null,
    });

    if (oldMediaUrl && !imageUrl) {
      const publicId = extractPublicId(oldMediaUrl);
      if (publicId.split("/")[0] !== UPLOADS_FOLDER) return;
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error(
          `Cloudinary file with public id: '${publicId}' not deleted. You will need to delete it manually.`,
        );
        return next(err);
      }
    }

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
