const { Router } = require("express");
const {
  commentPost,
  commentEditPut,
  commentRepliesGet,
  commentDeletePut,
} = require("../controllers/commentController");

const router = Router();

router.post("/", commentPost);
router.put("/:commentId", commentEditPut);
router.get("/:commentId/replies", commentRepliesGet);
router.put("/:commentId/delete", commentDeletePut);

module.exports = router;
