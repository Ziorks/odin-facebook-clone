const { Router } = require("express");
const {
  tokenExchangePost,
  refreshPost,
  logoutPost,
  googleOauthGet,
  googleCallbackGet,
  githubOauthGet,
  githubCallbackGet,
} = require("../controllers/authController");

const router = Router();

router.post("/oauth-token-exchange", tokenExchangePost);
router.post("/refresh", refreshPost);
router.post("/logout", logoutPost);
router.get("/google", googleOauthGet);
router.get("/google/callback", googleCallbackGet);
router.get("/github", githubOauthGet);
router.get("/github/callback", githubCallbackGet);

module.exports = router;
