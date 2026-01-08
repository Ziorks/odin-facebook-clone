const { validationResult } = require("express-validator");
const cloudinary = require("../utilities/cloudinary");
const { extractPublicId } = require("cloudinary-build-url");
const bcrypt = require("bcryptjs");
const db = require("../db/queries");
const {
  validateWork,
  validateSchool,
  validateCity,
  validateBasicInfo,
  validateDetails,
  validateUserUpdate,
} = require("../utilities/validators");
const {
  getUser,
  profileEditAuth,
  getWork,
  getSchool,
  getCity,
} = require("../middleware");

const allUsersGet = async (req, res) => {
  const users = await db.getAllUsers();

  return res.json({ users });
};

const userGet = [
  getUser,
  async (req, res) => {
    const user = req.paramsUser;

    if (req.user.id === user.id) {
      return res.json({ user });
    }

    const friendship = await db.getFriendshipByUserIds(req.user.id, user.id);
    return res.json({ user, friendship });
  },
];

const userPut = [
  getUser,
  profileEditAuth,
  validateUserUpdate,
  async (req, res, next) => {
    //TODO: This and the validation seem like a mess
    // perhaps try seperating routes for username,password,avatar,etc..
    // otherwise just make sure everything works as intended and call it good

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    //if picture was sent => upload to cloudinary
    if (req.file) {
      const { buffer, mimetype } = req.file;
      const b64 = Buffer.from(buffer).toString("base64");
      const dataURI = "data:" + mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "facebook_clone_profile_pics",
      });
      req.body.avatarURL = result.secure_url;
      req.body.avatarPublicId = result.public_id;
    }

    const user = req.paramsUser;
    const {
      avatarURL,
      avatarPublicId,
      username,
      email,
      newPassword,
      firstName,
      lastName,
    } = req.body;

    const doUpdate = async (hashedPassword) => {
      try {
        await db.updateUser(user.id, {
          username,
          hashedPassword,
          email,
          avatar: avatarURL,
          firstName,
          lastName,
        });
      } catch (err) {
        //delete new pic if something goes wrong
        if (avatarPublicId) {
          try {
            await cloudinary.uploader.destroy(avatarPublicId);
          } catch (err) {
            console.error(
              `Cloudinary file with public id: '${avatarPublicId}' not deleted. You will need to delete it manually.`
            );
            return next(err);
          }
        }
        return next(err);
      }

      //delete old picture from cloudinary
      const oldPicPublicId = extractPublicId(user.profile.avatar);
      if (
        req.file &&
        oldPicPublicId !== "messaging_app_profile_pics/icsll72wpxwcku6gb1by"
      ) {
        await cloudinary.uploader.destroy(oldPicPublicId);
      }

      return res.json({ message: "user updated" });
    };

    if (newPassword) {
      bcrypt.hash(newPassword, 10, async (err, hashedPassword) => {
        if (err) {
          return next(err);
        }

        doUpdate(hashedPassword);
      });
    } else {
      doUpdate();
    }
  },
];

const aboutOverviewGet = [
  getUser,
  async (req, res) => {
    const user = req.paramsUser;

    const overview = await db.getAboutOverviewByUserId(user.id);

    return res.json(overview);
  },
];

const aboutWorkAndEducationGet = [
  getUser,
  async (req, res) => {
    const user = req.paramsUser;

    const workAndEducation = await db.getWorkAndEducationByUserId(user.id);

    return res.json(workAndEducation);
  },
];

const workPost = [
  getUser,
  profileEditAuth,
  async (req, res, next) => {
    const MAX = 20;
    const count = await db.getUsersWorksCount(req.user.id);
    if (count >= MAX) {
      const msg = `You have reached the limit of ${MAX} workplaces. You will need to delete an existing workplace to add a new one.`;
      return res.status(400).json({
        errors: [{ msg }],
      });
    }

    return next();
  },
  validateWork,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const user = req.paramsUser;
    const {
      company,
      position,
      location,
      description,
      currentJob,
      startYear,
      endYear,
    } = req.body;

    await db.createWork(user.profile.workAndEducation.id, {
      company,
      position,
      location,
      description,
      currentJob,
      startYear,
      endYear,
    });

    return res.json({ message: "work created" });
  },
];

const workPut = [
  getUser,
  profileEditAuth,
  getWork,
  validateWork,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const {
      company,
      position,
      location,
      description,
      currentJob,
      startYear,
      endYear,
    } = req.body;

    await db.updateWork(req.work.id, {
      company,
      position,
      location,
      description,
      currentJob,
      startYear,
      endYear,
    });

    return res.json({ message: "work updated" });
  },
];

const workDelete = [
  getUser,
  profileEditAuth,
  getWork,
  async (req, res) => {
    await db.deleteWork(req.work.id);

    return res.json({ message: "work deleted" });
  },
];

const schoolPost = [
  getUser,
  profileEditAuth,
  async (req, res, next) => {
    const MAX = 20;
    const count = await db.getUsersSchoolsCount(req.user.id);
    if (count >= MAX) {
      const msg = `You have reached the limit of ${MAX} schools. You will need to delete an existing school to add a new one.`;
      return res.status(400).json({
        errors: [{ msg }],
      });
    }

    return next();
  },
  validateSchool,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const user = req.paramsUser;
    const { name, description, degree, startYear, endYear, graduated } =
      req.body;

    await db.createSchool(user.profile.workAndEducation.id, {
      name,
      description,
      degree,
      startYear,
      endYear,
      graduated,
    });

    return res.json({ message: "school created" });
  },
];

const schoolPut = [
  getUser,
  profileEditAuth,
  getSchool,
  validateSchool,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const { name, description, degree, startYear, endYear, graduated } =
      req.body;

    await db.updateSchool(req.school.id, {
      name,
      degree,
      description,
      startYear,
      endYear,
      graduated,
    });

    return res.json({ message: "school updated" });
  },
];

const schoolDelete = [
  getUser,
  profileEditAuth,
  getSchool,
  async (req, res) => {
    await db.deleteSchool(req.school.id);

    return res.json({ message: "school deleted" });
  },
];

const placesLivedGet = [
  getUser,
  async (req, res) => {
    const user = req.paramsUser;

    const placesLived = await db.getPlacesLivedByUserId(user.id);

    return res.json(placesLived);
  },
];

const cityPost = [
  getUser,
  profileEditAuth,
  async (req, res, next) => {
    const { isHometown, isCurrentCity } = req.body;

    if (isHometown && isCurrentCity) {
      const msg = `isHometown and isCurrentCity can't both be true. A city can either be a hometown or a current city but not both.`;
      return res.status(400).json({
        errors: [{ msg }],
      });
    }

    if (isHometown) {
      const hometown = await db.getUsersHometown(req.user.id);
      if (hometown) {
        const msg = `You can only have one hometown. You will need to delete or edit the existing hometown.`;
        return res.status(400).json({
          errors: [{ msg }],
        });
      }
    } else if (isCurrentCity) {
      const currentCity = await db.getUsersCurrentCity(req.user.id);
      if (currentCity) {
        const msg = `You can only have one current city. You will need to delete or edit the existing current city.`;
        return res.status(400).json({
          errors: [{ msg }],
        });
      }
    } else {
      const MAX = 20;
      const count = await db.getUsersCityCount(req.user.id);
      if (count >= MAX) {
        const msg = `You have reached the limit of ${MAX} cities. You will need to delete an existing city to add a new one.`;
        return res.status(400).json({
          errors: [{ msg }],
        });
      }
    }

    return next();
  },
  validateCity,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const user = req.paramsUser;
    const { name, yearMoved, isHometown, isCurrentCity } = req.body;

    if (isHometown) {
      await db.createHometown(user.profile.placesLived.id, { name });
    } else if (isCurrentCity) {
      await db.createCurrentCity(user.profile.placesLived.id, { name });
    } else {
      await db.createCity(user.profile.placesLived.id, {
        name,
        yearMoved,
      });
    }

    return res.json({ message: "city created" });
  },
];

const cityPut = [
  getUser,
  profileEditAuth,
  getCity,
  validateCity,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const { name, yearMoved } = req.body;

    await db.updateCity(req.city.id, {
      name,
      yearMoved,
    });

    return res.json({ message: "city updated" });
  },
];

const cityDelete = [
  getUser,
  profileEditAuth,
  getCity,
  async (req, res) => {
    await db.deleteCity(req.city.id);

    return res.json({ message: "city deleted" });
  },
];

const contactInfoGet = [
  getUser,
  async (req, res) => {
    const user = req.paramsUser;

    const contactInfo = await db.getContactInfoByUserId(user.id);

    return res.json(contactInfo);
  },
];

const contactInfoPut = [
  getUser,
  profileEditAuth,
  validateBasicInfo,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const user = req.paramsUser;
    const {
      phoneNumbers,
      emails,
      websites,
      socialLinks,
      gender,
      birthday,
      languages,
    } = req.body;

    await db.updateContactInfo(user.profile.contactInfo.id, {
      phoneNumbers,
      emails,
      websites,
      socialLinks,
      gender,
      birthday,
      languages,
    });

    return res.json({ message: "basic info updated" });
  },
];

const detailsGet = [
  getUser,
  async (req, res) => {
    const user = req.paramsUser;

    const details = await db.getDetailsByUserId(user.id);

    return res.json(details);
  },
];

const detailsPut = [
  getUser,
  profileEditAuth,
  validateDetails,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const user = req.paramsUser;
    const { aboutMe, quotes, music, books, tv, movies, sports, hobbies } =
      req.body;

    await db.updateDetails(user.profile.details.id, {
      aboutMe,
      quotes,
      music,
      books,
      tv,
      movies,
      sports,
      hobbies,
    });

    return res.json({ message: "details updated" });
  },
];

module.exports = {
  allUsersGet,
  userGet,
  userPut,
  aboutOverviewGet,
  aboutWorkAndEducationGet,
  workPost,
  workPut,
  workDelete,
  schoolPost,
  schoolPut,
  schoolDelete,
  placesLivedGet,
  cityPost,
  cityPut,
  cityDelete,
  contactInfoGet,
  contactInfoPut,
  detailsGet,
  detailsPut,
};
