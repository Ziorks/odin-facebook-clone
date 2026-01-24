const { Router } = require("express");
const { likeDelete } = require("../controllers/likeController");

const router = Router();

router.delete("/:likeId", likeDelete);

module.exports = router;
