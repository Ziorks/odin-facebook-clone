const { Router } = require("express");
const indexRouter = require("./indexRouter");
const authRouter = require("./authRouter");
const friendshipRouter = require("./friendshipRouter");
const userRouter = require("./userRouter");
const { jwtAuth } = require("../middleware");

const router = Router();

router.use("/", indexRouter);
router.use("/auth", authRouter);
router.use(jwtAuth);
//add protected routes here
router.use("/friendship", friendshipRouter);
router.use("/users", userRouter);
router.get("/test", (req, res) => {
  res.json({ message: "you've reached the protected route!" });
});

module.exports = router;
