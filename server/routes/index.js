const { Router } = require("express");
const indexRouter = require("./indexRouter");
const authRouter = require("./authRouter");
const friendshipRouter = require("./friendshipRouter");
const postRouter = require("../routes/postRouter");
const commentRouter = require("../routes/commentRouter");
const likeRouter = require("../routes/likeRouter");
const userRouter = require("./userRouter");
const wallRouter = require("./wallRouter");
const { jwtAuth } = require("../middleware");

const router = Router();

router.use("/", indexRouter);
router.use("/auth", authRouter);
router.use(jwtAuth);
//add protected routes here
router.use("/friendship", friendshipRouter);
router.use("/users", userRouter);
router.use("/posts", postRouter);
router.use("/comments", commentRouter);
router.use("/likes", likeRouter);
router.use("/wall", wallRouter);
router.get("/test", (req, res) => {
  res.json({ message: "you've reached the protected route!" });
});

module.exports = router;
