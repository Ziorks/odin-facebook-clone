const passport = require("passport");

const notFoundHandler = (req, res) => {
  return res.sendStatus(404);
};

const errorHandler = (error, req, res, next) => {
  console.error(error);
  return res.status(500).json({
    message: "an error occured on the server",
    error,
  });
};

const jwtAuth = passport.authenticate("jwt", { session: false });

module.exports = { notFoundHandler, errorHandler, jwtAuth };
