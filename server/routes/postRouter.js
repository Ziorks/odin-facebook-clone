const { Router } = require("express");
const {
  postPost,
  postGet,
  postPut,
  postDelete,
  postCommentsGet,
} = require("../controllers/postController");

const router = Router();

router.post("/", postPost);
router.route("/:postId").get(postGet).put(postPut).delete(postDelete);
router.get("/:postId/comments", postCommentsGet);

module.exports = router;
