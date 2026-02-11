const { Router } = require("express");
const {
  commentGet,
  commentEditPut,
  commentReplyPost,
  commentRepliesGet,
  commentDeletePut,
  commentLikePost,
  commentLikesGet,
} = require("../controllers/commentController");

const router = Router();

router.route("/:commentId").get(commentGet).put(commentEditPut);
router
  .route("/:commentId/replies")
  .post(commentReplyPost)
  .get(commentRepliesGet);
router.put("/:commentId/delete", commentDeletePut);
router.route("/:commentId/likes").post(commentLikePost).get(commentLikesGet);

module.exports = router;
