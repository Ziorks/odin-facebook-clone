const { validationResult } = require("express-validator");
const db = require("../db/queries");
const { getPost, postEditAuth, getPaginationQuery } = require("../middleware");
const {
  validatePostCreate,
  validatePostEdit,
} = require("../utilities/validators");
const { formatComment } = require("../utilities/helperFunctions");

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
    post.myLike = null;

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

    const { content } = req.body;

    const post = await db.updatePost(req.post.id, { content });
    post.myLike = req.post.myLike;

    return res.json({ message: "post edited", post });
  },
];

const postDelete = [
  getPost,
  postEditAuth,
  async (req, res) => {
    //Delete a post
    const post = await db.deletePost(req.post.id);
    post.myLike = req.post.myLike;

    return res.json({ message: "post deleted", post });
  },
];

const postCommentsGet = [
  getPost,
  getPaginationQuery,
  async (req, res) => {
    const postId = req.post.id;
    const { page, resultsPerPage } = req.pagination;

    const comments = await db.getPostComments(postId, { page, resultsPerPage });
    await Promise.all(
      comments.results.map(async (comment) =>
        formatComment(comment, req.user.id),
      ),
    );

    return res.json(comments);
  },
];

const postLikePost = [
  getPost,
  async (req, res) => {
    const { post } = req;

    if (post.myLike) {
      return res
        .status(400)
        .json({ message: "you have already liked this post" });
    }

    const like = await db.createLike(req.user.id, post.id, "POST");

    return res.json({ message: "post like created", like });
  },
];

const postLikesGet = [
  getPost,
  getPaginationQuery,
  async (req, res) => {
    const { page, resultsPerPage } = req.pagination;

    const likes = await db.getPostLikes(req.post.id, { page, resultsPerPage });

    return res.json(likes);
  },
];

module.exports = {
  postPost,
  postGet,
  postPut,
  postDelete,
  postCommentsGet,
  postLikePost,
  postLikesGet,
};
