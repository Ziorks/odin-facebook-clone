const { Router } = require("express");
const {
  postPost,
  postGet,
  postPut,
  postDelete,
  postCommentsGet,
  postLikePost,
  postLikesGet,
} = require("../controllers/postController");

const router = Router();

router.post("/", postPost);
router.route("/:postId").get(postGet).put(postPut).delete(postDelete);
router.get("/:postId/comments", postCommentsGet);
router.post("/:postId/like", postLikePost);
router.get("/:postId/likes", postLikesGet);

module.exports = router;
