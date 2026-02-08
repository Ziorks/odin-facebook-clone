const db = require("../db/queries");
const {
  getPost,
  postEditAuth,
  getPaginationQuery,
  uploadFileToCloudinary,
} = require("../middleware");
const {
  validatePostCreate,
  validatePostEdit,
} = require("../utilities/validators");
const {
  formatComment,
  deleteFromCloudinary,
  deleteUploadedFilesFromPost,
} = require("../utilities/helperFunctions");
const { POST_UPLOAD_FOLDER } = require("../utilities/constants");

const postPost = [
  validatePostCreate,
  uploadFileToCloudinary(POST_UPLOAD_FOLDER),
  async (req, res) => {
    //Create a regular post
    const authorId = req.user.id;
    const { wallId, content, uploadedFileUrl, imageUrl } = req.body;

    try {
      const post = await db.createRegularPost(
        authorId,
        wallId,
        content,
        uploadedFileUrl || imageUrl,
      );
      post.myLike = null;

      return res.json({ message: "post created", post });
    } catch (err) {
      //delete new pic if user update fails
      if (uploadedFileUrl) {
        await deleteFromCloudinary(uploadedFileUrl, POST_UPLOAD_FOLDER);
      }

      throw new Error(err);
    }
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
  uploadFileToCloudinary(POST_UPLOAD_FOLDER),
  async (req, res) => {
    //Update a post
    const { content, uploadedFileUrl, imageUrl } = req.body;
    const oldMediaUrl = req.post.mediaUrl;
    const newMediaUrl = uploadedFileUrl || imageUrl || null;

    const post = await db.updatePost(req.post.id, {
      content: content ?? null,
      mediaUrl: newMediaUrl,
    });

    if (oldMediaUrl && oldMediaUrl !== newMediaUrl && post.type === "REGULAR") {
      await deleteFromCloudinary(oldMediaUrl, POST_UPLOAD_FOLDER);
    }

    post.myLike = req.post.myLike;

    return res.json({ message: "post edited", post });
  },
];

const postDelete = [
  getPost,
  postEditAuth,
  async (req, res) => {
    //Delete a post
    await deleteUploadedFilesFromPost(req.post);

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
