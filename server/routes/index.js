const { Router } = require("express");
const indexRouter = require("./indexRouter");
const { jwtAuth } = require("../middleware");

const router = Router();

router.use("/", indexRouter);
router.use(jwtAuth);
//add protected routes here
module.exports = router;
