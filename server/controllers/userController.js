const { validationResult } = require("express-validator");
const db = require("../db/queries");
const { validateWork } = require("../utilities/validators");
const {
  getUser,
  profileEditAuth,
  getWork,
  maxWorksCheck,
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

const aboutOverviewGet = async (req, res) => {
  const { userId } = req.params;

  /*TODO: 
    -latest work
    -latest school
    -current city
    -hometown
  */
};

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
    const MAX = 3;
    const count = await db.getUsersWorksCount(req.user.id);
    if (count >= MAX) {
      return res.status(400).json({
        message: `You have reached the limit of ${MAX} workplaces. You will need to delete an existing workplace to add a new one.`,
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
      position: position || null,
      location: location || null,
      description: description || null,
      currentJob,
      startYear: startYear || null,
      endYear: endYear || null,
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

module.exports = {
  allUsersGet,
  userGet,
  aboutOverviewGet,
  aboutWorkAndEducationGet,
  workPost,
  workPut,
  workDelete,
};
