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
  body("email")
    .exists()
    .withMessage("'email'" + existsMessage)
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Email must be a valid email address"),
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

const validatePostEdit = [
  body("content")
    .exists()
    .withMessage("'content'" + existsMessage)
    .trim()
    .isString()
    .withMessage("Content must be a string"),
];

const validatePostCreate = [
  ...validatePostEdit,
  body("wallId")
    .exists()
    .withMessage("'wallId'" + existsMessage)
    .isInt()
    .withMessage("WallId must be an integer")
    .toInt(),
];

const validateCommentEdit = [
  body("content")
    .exists()
    .withMessage("'content'" + existsMessage)
    .trim()
    .isString()
    .withMessage("Content must be a string"),
];

const validateCommentCreate = [
  ...validateCommentEdit,
  body("postId")
    .exists()
    .withMessage("'postId'" + existsMessage)
    .isInt()
    .withMessage("PostId must be an integer"),
  body("parentId")
    .optional({ values: "null" })
    .isInt()
    .withMessage("ParentId must be an integer or null")
    .toInt(),
  ,
];

const validateLike = [
  body("targetId")
    .exists()
    .withMessage("'targetId'" + existsMessage)
    .isInt()
    .withMessage("TargetId must be an integer")
    .toInt(),
  body("targetType")
    .exists()
    .withMessage("'targetType'" + existsMessage)
    .trim()
    .isIn(["POST", "COMMENT"])
    .withMessage("TargetType must be either 'POST' or 'COMMENT'"),
];

module.exports = {
  validateRegister,
  validatePostCreate,
  validatePostEdit,
  validateCommentCreate,
  validateCommentEdit,
  validateLike,
};
