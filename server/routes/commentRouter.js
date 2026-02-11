const { Router } = require("express");
const {
  commentPost,
  commentGet,
  commentEditPut,
  commentRepliesGet,
  commentDeletePut,
  commentLikePost,
  commentLikesGet,
} = require("../controllers/commentController");

const router = Router();

router.post("/", commentPost);
router.route("/:commentId").get(commentGet).put(commentEditPut);
router.get("/:commentId/replies", commentRepliesGet);
router.put("/:commentId/delete", commentDeletePut);
router.route("/:commentId/likes").post(commentLikePost).get(commentLikesGet);

module.exports = router;
