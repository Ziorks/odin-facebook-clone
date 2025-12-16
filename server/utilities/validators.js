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

const validateWork = [
  body("company")
    .exists()
    .withMessage("'company'" + existsMessage)
    .isString()
    .withMessage("Company must be a string")
    .trim()
    .notEmpty()
    .withMessage("Company can't be an empty string")
    .isLength({ max: 128 })
    .withMessage("Company can be no longer than 128 characters"),
  body("position")
    .optional()
    .isString()
    .withMessage("Position must be a string")
    .trim()
    .isLength({ max: 128 })
    .withMessage("Position can be no longer than 128 characters"),
  body("location")
    .optional()
    .isString()
    .withMessage("Location must be a string")
    .trim()
    .isLength({ max: 128 })
    .withMessage("Location can be no longer than 128 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .isLength({ max: 256 })
    .withMessage("Description can be no longer than 256 characters"),
  body("startYear")
    .optional()
    .isInt()
    .withMessage("StartYear must be an integer"),
  body("endYear")
    .optional()
    .isInt()
    .withMessage("EndYear must be an integer")
    .custom((value, { req }) => {
      return value >= req.body.startYear;
    })
    .withMessage("EndYear cannot be less than StartYear"),
  body("currentJob")
    .customSanitizer((value, { req }) => {
      return req.body.endYear ? value : true;
    })
    .exists()
    .withMessage("'currentJob'" + existsMessage)
    .isBoolean()
    .withMessage("CurrentJob must be a boolean"),
];

const validateSchool = [
  body("name")
    .exists()
    .withMessage("'name'" + existsMessage)
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Name can't be an empty string")
    .isLength({ max: 128 })
    .withMessage("Name can be no longer than 128 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .isLength({ max: 256 })
    .withMessage("Description can be no longer than 256 characters"),
  body("degree")
    .optional()
    .isString()
    .withMessage("Degree must be a string")
    .trim()
    .isLength({ max: 128 })
    .withMessage("Degree can be no longer than 128 characters"),
  body("startYear")
    .optional()
    .isInt()
    .withMessage("StartYear must be an integer"),
  body("endYear")
    .optional()
    .isInt()
    .withMessage("EndYear must be an integer")
    .custom((value, { req }) => {
      return value >= req.body.startYear;
    })
    .withMessage("EndYear cannot be less than StartYear"),
  body("graduated")
    .exists()
    .withMessage("'graduated'" + existsMessage)
    .isBoolean()
    .withMessage("Graduated must be a boolean"),
];

const validateCity = [
  body("name")
    .exists()
    .withMessage("'name'" + existsMessage)
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Name can't be an empty string")
    .isLength({ max: 64 })
    .withMessage("Name can be no longer than 64 characters"),
  body("yearMoved")
    .optional()
    .isInt()
    .withMessage("YearMoved must be an integer"),
  body("isHometown")
    .optional()
    .isBoolean()
    .withMessage("IsHometown must be a boolean"),
  body("isCurrentCity")
    .optional()
    .isBoolean()
    .withMessage("IsCurrentCity must be a boolean"),
];

module.exports = {
  validateRegister,
  validatePostCreate,
  validatePostEdit,
  validateCommentCreate,
  validateCommentEdit,
  validateLike,
  validateWork,
  validateSchool,
  validateCity,
};
