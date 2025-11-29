const { Router } = require("express");
const { wallGet } = require("../controllers/wallController");

const router = Router();

router.get("/:wallId", wallGet);

module.exports = router;
