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
    .optional({ values: "null" })
    .isString()
    .withMessage("Position must be a string")
    .trim()
    .isLength({ max: 128 })
    .withMessage("Position can be no longer than 128 characters"),
  body("location")
    .optional({ values: "null" })
    .isString()
    .withMessage("Location must be a string")
    .trim()
    .isLength({ max: 128 })
    .withMessage("Location can be no longer than 128 characters"),
  body("description")
    .optional({ values: "null" })
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .isLength({ max: 256 })
    .withMessage("Description can be no longer than 256 characters"),
  body("startYear")
    .optional({ values: "null" })
    .isInt()
    .withMessage("StartYear must be an integer"),
  body("endYear")
    .optional({ values: "null" })
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
    .optional({ values: "null" })
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .isLength({ max: 256 })
    .withMessage("Description can be no longer than 256 characters"),
  body("degree")
    .optional({ values: "null" })
    .isString()
    .withMessage("Degree must be a string")
    .trim()
    .isLength({ max: 128 })
    .withMessage("Degree can be no longer than 128 characters"),
  body("startYear")
    .optional({ values: "null" })
    .isInt()
    .withMessage("StartYear must be an integer"),
  body("endYear")
    .optional({ values: "null" })
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
    .optional({ values: "null" })
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

const validateBasicInfo = [
  body("phoneNumbers")
    .optional()
    .isArray({ max: 5 })
    .withMessage("PhoneNumbers must be an array of at most 5 elements")
    .bail()
    .customSanitizer((arr) =>
      arr
        .map((string) => (typeof string === "string" ? string.trim() : string))
        .filter((string) =>
          typeof string === "string" ? string.length > 0 : true
        )
    ),
  body("phoneNumbers.*")
    .isString()
    .withMessage("Each element of phoneNumbers must be a string")
    .bail()
    .isLength({ max: 32 })
    .withMessage("Each string in phoneNumbers must be 32 characters or less"),
  body("emails")
    .optional()
    .isArray({ max: 5 })
    .withMessage("Emails must be an array of at most 5 elements")
    .bail()
    .customSanitizer((arr) =>
      arr
        .map((string) => (typeof string === "string" ? string.trim() : string))
        .filter((string) =>
          typeof string === "string" ? string.length > 0 : true
        )
    ),
  body("emails.*")
    .isEmail()
    .withMessage("Each element of emails must be an email address")
    .bail()
    .isLength({ max: 64 })
    .withMessage("Each email must be 64 characters or less"),
  body("websites")
    .optional()
    .isArray({ max: 5 })
    .withMessage("Websites must be an array of at most 5 elements")
    .bail()
    .customSanitizer((arr) =>
      arr
        .map((string) => (typeof string === "string" ? string.trim() : string))
        .filter((string) =>
          typeof string === "string" ? string.length > 0 : true
        )
    ),
  body("websites.*")
    .isURL()
    .withMessage("Each element of websites must be a URL")
    .bail()
    .isLength({ max: 128 })
    .withMessage("Each website must be 128 characters or less"),
  body("socialLinks")
    .optional()
    .isArray({ max: 5 })
    .withMessage("SocialLinks must be an array of at most 5 elements")
    .bail()
    .customSanitizer((arr) =>
      arr
        .map((string) => (typeof string === "string" ? string.trim() : string))
        .filter((string) =>
          typeof string === "string" ? string.length > 0 : true
        )
    ),
  body("socialLinks.*")
    .isURL()
    .withMessage("Each element of socialLinks must be a URL")
    .bail()
    .isLength({ max: 128 })
    .withMessage("Each socialLink must be 128 characters or less"),

  body("gender")
    .optional({ values: "null" })
    .trim()
    .toUpperCase()
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Gender must be one of 'MALE', 'FEMALE', or 'OTHER'"),
  body("birthday")
    .optional()
    .isObject()
    .withMessage("Birthday must be an object"),
  body("birthday.month")
    .optional({ values: "null" })
    .isInt({ min: 1, max: 12 })
    .withMessage("Birthday month must be an integer between 1 and 12"),
  body("birthday.day")
    .optional({ values: "null" })
    .custom((_, { req }) => {
      return req.body.birthday?.month;
    })
    .withMessage("A month is required to add a day.")
    .isInt({ min: 1, max: 31 })
    .withMessage("Birthday day must be an integer between 1 and 31"),
  body("birthday.year")
    .optional({ values: "null" })
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage("Birthday year must be a valid year"),
  body("languages")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Languages must be an array of at most 20 elements")
    .bail()
    .customSanitizer((arr) =>
      arr
        .map((string) => (typeof string === "string" ? string.trim() : string))
        .filter((string) =>
          typeof string === "string" ? string.length > 0 : true
        )
    ),
  body("languages.*")
    .isString()
    .withMessage("Each element of languages must be a string")
    .bail()
    .isLength({ max: 32 })
    .withMessage("Each language must be 32 characters or less"),
];

const validateDetails = [
  body("aboutMe")
    .optional({ values: "null" })
    .trim()
    .isString()
    .withMessage("aboutMe must be a string")
    .bail()
    .notEmpty()
    .withMessage("aboutMe can't be an empty string")
    .bail()
    .isLength({ max: 512 })
    .withMessage("aboutMe must be 512 characters or less"),
  body("quotes")
    .optional({ values: "null" })
    .trim()
    .isString()
    .withMessage("quotes must be a string")
    .bail()
    .notEmpty()
    .withMessage("quotes can't be an empty string")
    .bail()
    .isLength({ max: 512 })
    .withMessage("quotes must be 512 characters or less"),
  body("music")
    .optional({ values: "null" })
    .trim()
    .isString()
    .withMessage("music must be a string")
    .bail()
    .notEmpty()
    .withMessage("music can't be an empty string")
    .bail()
    .isLength({ max: 512 })
    .withMessage("music must be 512 characters or less"),
  body("books")
    .optional({ values: "null" })
    .trim()
    .isString()
    .withMessage("books must be a string")
    .bail()
    .notEmpty()
    .withMessage("books can't be an empty string")
    .bail()
    .isLength({ max: 512 })
    .withMessage("books must be 512 characters or less"),
  body("tv")
    .optional({ values: "null" })
    .trim()
    .isString()
    .withMessage("tv must be a string")
    .bail()
    .notEmpty()
    .withMessage("tv can't be an empty string")
    .bail()
    .isLength({ max: 512 })
    .withMessage("tv must be 512 characters or less"),
  body("movies")
    .optional({ values: "null" })
    .trim()
    .isString()
    .withMessage("movies must be a string")
    .bail()
    .notEmpty()
    .withMessage("movies can't be an empty string")
    .bail()
    .isLength({ max: 512 })
    .withMessage("movies must be 512 characters or less"),
  body("sports")
    .optional({ values: "null" })
    .trim()
    .isString()
    .withMessage("sports must be a string")
    .bail()
    .notEmpty()
    .withMessage("sports can't be an empty string")
    .bail()
    .isLength({ max: 512 })
    .withMessage("sports must be 512 characters or less"),
  body("hobbies")
    .optional({ values: "null" })
    .trim()
    .isString()
    .withMessage("hobbies must be a string")
    .bail()
    .notEmpty()
    .withMessage("hobbies can't be an empty string")
    .bail()
    .isLength({ max: 512 })
    .withMessage("hobbies must be 512 characters or less"),
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
  validateBasicInfo,
  validateDetails,
};
