const { Router } = require("express");
const { allUsersGet, userGet } = require("../controllers/userController");

const router = Router();

router.get("/", allUsersGet);
router.get("/:userId", userGet);

module.exports = router;
