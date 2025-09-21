const { Router } = require("express");
const { indexGet } = require("../controllers/indexController");

const router = Router();

router.get("/", indexGet);

module.exports = router;
