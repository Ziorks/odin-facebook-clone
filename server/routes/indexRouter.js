const { Router } = require("express");
const {
  loginPost,
  registerPost,
  refreshPost,
  logoutPost,
} = require("../controllers/indexController");

const router = Router();

router.post("/login", loginPost);
router.post("/register", registerPost);
router.post("/refresh", refreshPost);
router.post("/logout", logoutPost);

module.exports = router;
