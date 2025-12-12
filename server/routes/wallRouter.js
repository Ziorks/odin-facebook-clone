const { Router } = require("express");
const { wallGet } = require("../controllers/wallController");

const router = Router();

//TODO: move wall route to user router ie: api/v1/users/:userId/wall

router.get("/:wallId", wallGet);

module.exports = router;
