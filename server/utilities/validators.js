const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); //2MB limit
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const db = require("../db/queries");

const existsMessage = " is required";

const errorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "validation failed", errors: errors.array() });
  }

  return next();
};

const validateRegister = [
  body("username")
    .exists()
    .withMessage("Username" + existsMessage)
    .bail()
    .trim()
    .isAlphanumeric()
    .withMessage("Username can only contain letters and numbers")
    .isLength({ min: 5, max: 16 })
    .withMessage("Username must be between 5 and 16 characters long"),
  body("email")
    .exists()
    .withMessage("Email" + existsMessage)
    .bail()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("password")
    .exists()
    .withMessage("Password" + existsMessage)
    .bail()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("passwordConfirmation")
    .exists()
    .withMessage("Password confirmation" + existsMessage)
    .bail()
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Password confirmation doesn't match password"),
  errorHandler,
];

const validateUserUpdate = [
  body("username").optional().trim(),
  body("email").optional().trim(),
  body("oldPassword").optional().trim(),
  (req, res, next) => {
    upload.single("avatar")(req, res, async (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          req.fileValidationError = {
            msg: "File too large. Max 2MB allowed.",
          };
        } else {
          return next(err);
        }
      }

      const user = await db.getUserById(+req.params.userId);

      const { username, email, oldPassword, newPassword } = req.body;

      req.isOldPasswordRequired = !!(user.password && newPassword);

      if (username) {
        const newUsernameUser = await db.getUserByUsername(username);
        if (newUsernameUser && newUsernameUser.id !== user.id) {
          req.usernameValidationError = {
            msg: "Username is taken",
          };
        }
      }

      if (email) {
        const newEmailUser = await db.getUserByEmail(email);
        if (newEmailUser && newEmailUser.id !== user.id) {
          req.emailValidationError = {
            msg: "Email is already in use",
          };
        }
      }

      if (oldPassword && req.isOldPasswordRequired) {
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
          req.oldPasswordValidationError = {
            msg: "Old password is incorrect",
          };
        }
      }

      return next();
    });
  },
  body("avatar").custom((_, { req }) => {
    if (req.fileValidationError) {
      throw new Error(req.fileValidationError.msg);
    }

    const avatar = req.file;
    if (!avatar) return true;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(avatar.mimetype)) {
      throw new Error("Avatar must be an image file");
    }
    return true;
  }),
  body("username")
    .optional()
    .custom((_, { req }) => {
      if (req.usernameValidationError) {
        throw new Error(req.usernameValidationError.msg);
      }

      return true;
    })
    .bail()
    .isAlphanumeric()
    .withMessage("Username can only contain letters and numbers")
    .isLength({ min: 5, max: 16 })
    .withMessage("Username must be between 5 and 16 characters long"),
  body("email")
    .optional()
    .custom((_, { req }) => {
      if (req.emailValidationError) {
        throw new Error(req.emailValidationError.msg);
      }

      return true;
    })
    .bail()
    .toLowerCase()
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("oldPassword").custom((value, { req }) => {
    if (req.isOldPasswordRequired && !value) {
      throw new Error("Old password is required to update password");
    }

    if (req.oldPasswordValidationError) {
      throw new Error(req.oldPasswordValidationError.msg);
    }

    return true;
  }),
  body("newPassword")
    .optional()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("passwordConfirmation").optional().trim(),
  body("passwordConfirmation")
    .custom((value, { req }) => {
      if (req.body.newPassword) {
        return value === req.body.newPassword;
      }
      return true;
    })
    .withMessage("Password confirmation must match new password"),
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage("First name must be between 1 and 64 characters")
    .isAlpha()
    .withMessage("First name must only contain letters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage("Last name must be between 1 and 64 characters")
    .isAlpha()
    .withMessage("Last name must only contain letters"),
  errorHandler,
];

const validatePost = [
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          req.fileValidationError = {
            msg: "File too large. Max 2MB allowed.",
          };
        } else {
          return next(err);
        }
      }

      return next();
    });
  },
  body("content")
    .optional()
    .isString()
    .withMessage("Content must be a string")
    .bail()
    .trim()
    .isLength({ max: 2048 })
    .withMessage("Content must be 2048 characters or less"),
  body("imageUrl")
    .optional()
    .isURL()
    .withMessage("Image URL must be a valid URL")
    .bail()
    .isLength({ max: 256 })
    .withMessage("Image URL must be 256 characters or less"),
  body("image").custom((_, { req }) => {
    if (req.fileValidationError) {
      throw new Error(req.fileValidationError.msg);
    }

    const image = req.file;
    if (!image) return true;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(image.mimetype)) {
      throw new Error("Image must be an image file");
    }

    return true;
  }),
  body("privacy")
    .optional()
    .isIn(["PUBLIC", "FRIENDS_ONLY", "PRIVATE"])
    .withMessage(
      "Privacy must be one of 'PUBLIC', 'FRIENDS_ONLY', or 'PRIVATE'",
    ),
  errorHandler,
];

const validateComment = [
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          req.fileValidationError = {
            msg: "File too large. Max 2MB allowed.",
          };
        } else {
          return next(err);
        }
      }

      return next();
    });
  },
  body("content")
    .optional()
    .isString()
    .withMessage("Content must be a string")
    .bail()
    .trim()
    .isLength({ max: 512 })
    .withMessage("Content must be 512 characters or less"),
  body("imageUrl")
    .optional()
    .isURL()
    .withMessage("Image URL must be a valid URL")
    .bail()
    .isLength({ max: 256 })
    .withMessage("Image URL must be 256 characters or less"),
  body("image").custom((_, { req }) => {
    if (req.fileValidationError) {
      throw new Error(req.fileValidationError.msg);
    }

    const image = req.file;
    if (!image) return true;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(image.mimetype)) {
      throw new Error("Image must be an image file");
    }

    return true;
  }),
  errorHandler,
];

const validateWork = [
  body("company")
    .exists()
    .withMessage("Company" + existsMessage)
    .bail()
    .isString()
    .withMessage("Company must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Company can't be an empty string")
    .isLength({ max: 128 })
    .withMessage("Company can be no longer than 128 characters"),
  body("position")
    .optional({ values: "null" })
    .isString()
    .withMessage("Position must be a string")
    .bail()
    .trim()
    .isLength({ max: 128 })
    .withMessage("Position can be no longer than 128 characters"),
  body("location")
    .optional({ values: "null" })
    .isString()
    .withMessage("Location must be a string")
    .bail()
    .trim()
    .isLength({ max: 128 })
    .withMessage("Location can be no longer than 128 characters"),
  body("description")
    .optional({ values: "null" })
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .trim()
    .isLength({ max: 256 })
    .withMessage("Description can be no longer than 256 characters"),
  body("startYear")
    .optional({ values: "null" })
    .isInt()
    .withMessage("Start year must be an integer"),
  body("endYear")
    .optional({ values: "null" })
    .isInt()
    .withMessage("End year must be an integer")
    .bail()
    .custom((value, { req }) => {
      return value >= req.body.startYear;
    })
    .withMessage("End year cannot be less than start year"),
  body("currentJob")
    .customSanitizer((value, { req }) => {
      return req.body.endYear ? value : true;
    })
    .exists()
    .withMessage("Current job'" + existsMessage)
    .bail()
    .isBoolean()
    .withMessage("Current job must be a boolean"),
  errorHandler,
];

const validateSchool = [
  body("name")
    .exists()
    .withMessage("Name" + existsMessage)
    .bail()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name can't be an empty string")
    .isLength({ max: 128 })
    .withMessage("Name can be no longer than 128 characters"),
  body("description")
    .optional({ values: "null" })
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .trim()
    .isLength({ max: 256 })
    .withMessage("Description can be no longer than 256 characters"),
  body("degree")
    .optional({ values: "null" })
    .isString()
    .withMessage("Degree must be a string")
    .bail()
    .trim()
    .isLength({ max: 128 })
    .withMessage("Degree can be no longer than 128 characters"),
  body("startYear")
    .optional({ values: "null" })
    .isInt()
    .withMessage("Start year must be an integer"),
  body("endYear")
    .optional({ values: "null" })
    .isInt()
    .withMessage("End year must be an integer")
    .bail()
    .custom((value, { req }) => {
      return value >= req.body.startYear;
    })
    .withMessage("End year cannot be less than start year"),
  body("graduated")
    .exists()
    .withMessage("Graduated" + existsMessage)
    .bail()
    .isBoolean()
    .withMessage("Graduated must be a boolean"),
  errorHandler,
];

const validateCity = [
  body("name")
    .exists()
    .withMessage("Name" + existsMessage)
    .bail()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name can't be an empty string")
    .isLength({ max: 64 })
    .withMessage("Name can be no longer than 64 characters"),
  body("yearMoved")
    .optional({ values: "null" })
    .isInt()
    .withMessage("Year moved must be an integer"),
  body("isHometown")
    .optional()
    .isBoolean()
    .withMessage("Is hometown must be a boolean"),
  body("isCurrentCity")
    .optional()
    .isBoolean()
    .withMessage("Is current city must be a boolean"),
  errorHandler,
];

const validateBasicInfo = [
  body("phoneNumbers")
    .optional()
    .isArray({ max: 5 })
    .withMessage("Phone numbers must be an array of at most 5 elements")
    .bail()
    .customSanitizer((arr) =>
      arr
        .map((string) => (typeof string === "string" ? string.trim() : string))
        .filter((string) =>
          typeof string === "string" ? string.length > 0 : true,
        ),
    ),
  body("phoneNumbers.*")
    .isString()
    .withMessage("Each phone number must be a string")
    .bail()
    .isLength({ max: 32 })
    .withMessage("Each string in phone numbers must be 32 characters or less"),
  body("emails")
    .optional()
    .isArray({ max: 5 })
    .withMessage("Emails must be an array of at most 5 elements")
    .bail()
    .customSanitizer((arr) =>
      arr
        .map((string) => (typeof string === "string" ? string.trim() : string))
        .filter((string) =>
          typeof string === "string" ? string.length > 0 : true,
        ),
    ),
  body("emails.*")
    .isEmail()
    .withMessage("Each email must be an email address")
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
          typeof string === "string" ? string.length > 0 : true,
        ),
    ),
  body("websites.*")
    .isURL()
    .withMessage("Each website must be a URL")
    .bail()
    .isLength({ max: 128 })
    .withMessage("Each website must be 128 characters or less"),
  body("socialLinks")
    .optional()
    .isArray({ max: 5 })
    .withMessage("Social links must be an array of at most 5 elements")
    .bail()
    .customSanitizer((arr) =>
      arr
        .map((string) => (typeof string === "string" ? string.trim() : string))
        .filter((string) =>
          typeof string === "string" ? string.length > 0 : true,
        ),
    ),
  body("socialLinks.*")
    .isURL()
    .withMessage("Each social link must be a URL")
    .bail()
    .isLength({ max: 128 })
    .withMessage("Each social link must be 128 characters or less"),
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
          typeof string === "string" ? string.length > 0 : true,
        ),
    ),
  body("languages.*")
    .isString()
    .withMessage("Each language must be a string")
    .bail()
    .isLength({ max: 32 })
    .withMessage("Each language must be 32 characters or less"),
  errorHandler,
];

function detailValidationChain(fieldname) {
  return body(fieldname)
    .optional({ values: "null" })
    .isString()
    .withMessage(fieldname + " must be a string")
    .bail()
    .trim()
    .customSanitizer((value) => value || null)
    .isLength({ max: 512 })
    .withMessage(fieldname + " must be 512 characters or less");
}

const validateDetails = [
  detailValidationChain("aboutMe"),
  detailValidationChain("quotes"),
  detailValidationChain("music"),
  detailValidationChain("books"),
  detailValidationChain("tv"),
  detailValidationChain("movies"),
  detailValidationChain("sports"),
  detailValidationChain("hobbies"),
  errorHandler,
];

module.exports = {
  validateRegister,
  validateUserUpdate,
  validatePost,
  validateComment,
  validateWork,
  validateSchool,
  validateCity,
  validateBasicInfo,
  validateDetails,
};
