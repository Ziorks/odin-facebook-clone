const { Router } = require("express");
const { loginPost, registerPost } = require("../controllers/indexController");

const router = Router();

router.post("/login", loginPost);
router.post("/register", registerPost);

module.exports = router;
