const { Router } = require("express");
const { likePost, likeDelete } = require("../controllers/likeController");

const router = Router();

router.route("/").post(likePost).delete(likeDelete);

module.exports = router;
