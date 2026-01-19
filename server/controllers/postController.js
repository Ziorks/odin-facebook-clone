const { validationResult } = require("express-validator");
const db = require("../db/queries");
const { getPost, postEditAuth } = require("../middleware");
const { formatComment } = require("../utilities/helperFunctions");
const {
  validatePostCreate,
  validatePostEdit,
} = require("../utilities/validators");

const postPost = [
  validatePostCreate,
  async (req, res) => {
    //Create a regular post
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const authorId = req.user.id;
    const { wallId, content } = req.body;

    const isWallIdValid = await db.getUserById(wallId);
    if (!isWallIdValid) {
      return res.status(400).json({
        message: "validation failed",
        errors: [
          {
            type: "field",
            value: wallId,
            msg: "wallId is not a valid user id",
            path: "wallId",
            location: "body",
          },
        ],
      });
    }

    const post = await db.createRegularPost(authorId, wallId, content);
    return res.json({ message: "post created", post });
  },
];

const postGet = [
  getPost,
  async (req, res) => {
    //Get a single post
    return res.json({ post: req.post });
  },
];

const postPut = [
  getPost,
  postEditAuth,
  validatePostEdit,
  async (req, res) => {
    //Update a post
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const postId = req.post.id;
    const { content } = req.body;

    await db.updatePost(postId, { content });
    return res.json({ message: "post edited" });
  },
];

const postDelete = [
  getPost,
  postEditAuth,
  async (req, res) => {
    //Delete a post
    const postId = req.post.id;

    await db.deletePost(postId);
    return res.json({ message: "post deleted" });
  },
];

const postCommentsGet = [
  getPost,
  async (req, res) => {
    const postId = req.post.id;

    const comments = await db.getPostComments(postId);
    comments.forEach((comment) => {
      formatComment(comment, req.user.id);
    });

    return res.json({ comments });
  },
];

module.exports = { postPost, postGet, postPut, postDelete, postCommentsGet };
