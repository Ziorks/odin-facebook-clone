const { Router } = require("express");
const indexRouter = require("./indexRouter");
const { jwtAuth } = require("../middleware");

const router = Router();

router.use("/", indexRouter);
router.use(jwtAuth);
//add protected routes here
router.get("/test", (req, res) => {
  res.json({ message: "you've reached the protected route!" });
});
module.exports = router;
