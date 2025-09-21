const { Router } = require("express");
const indexRouter = require("./indexRouter");

const router = Router();

router.use("/", indexRouter);

module.exports = router;
