const { body } = require("express-validator");

const existsMessage = " is required";

const validateRegister = [
  body("username")
    .exists()
    .withMessage("'username'" + existsMessage)
    .trim()
    .isAlphanumeric()
    .withMessage("Username can only contain letters and numbers")
    .isLength({ min: 5, max: 16 })
    .withMessage("Username must be between 5 and 16 characters long"),
  body("password")
    .exists()
    .withMessage("'password'" + existsMessage)
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("passwordConfirmation")
    .exists()
    .withMessage("'passwordConfirmation'" + existsMessage)
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("'passwordConfirmation' must match 'password'"),
];

module.exports = { validateRegister };
