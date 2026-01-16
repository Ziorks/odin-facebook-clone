const { Router } = require("express");
const { feedGet } = require("../controllers/feedController");

const router = Router();

router.get("/", feedGet);

module.exports = router;
