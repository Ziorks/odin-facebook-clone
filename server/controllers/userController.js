const { validationResult } = require("express-validator");
const db = require("../db/queries");
const {
  validateWork,
  validateSchool,
  validateCity,
} = require("../utilities/validators");
const {
  getUser,
  profileEditAuth,
  getWork,
  getSchool,
  getCity,
  getHometown,
  getCurrentCity,
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
    const MAX = 20;
    const count = await db.getUsersWorksCount(req.user.id);
    if (count >= MAX) {
      return res.status(400).json({
        errors: [
          {
            msg: `You have reached the limit of ${MAX} workplaces. You will need to delete an existing workplace to add a new one.`,
          },
        ],
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

const schoolPost = [
  getUser,
  profileEditAuth,
  async (req, res, next) => {
    const MAX = 20;
    const count = await db.getUsersSchoolsCount(req.user.id);
    if (count >= MAX) {
      return res.status(400).json({
        errors: [
          {
            msg: `You have reached the limit of ${MAX} schools. You will need to delete an existing school to add a new one.`,
          },
        ],
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
      degree: degree || null,
      description: description || null,
      startYear: startYear || null,
      endYear: endYear || null,
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
    const MAX = 20;
    const count = await db.getUsersCityCount(req.user.id);
    if (count >= MAX) {
      return res.status(400).json({
        errors: [
          {
            msg: `You have reached the limit of ${MAX} cities. You will need to delete an existing city to add a new one.`,
          },
        ],
      });
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
    const { name, yearMoved } = req.body;

    await db.createCity(user.profile.placesLived.id, {
      name,
      yearMoved,
    });

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
      yearMoved: yearMoved || null,
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

const hometownPost = [
  getUser,
  profileEditAuth,
  async (req, res, next) => {
    const hometown = await db.getUsersHometown(req.user.id);
    if (hometown) {
      return res.status(400).json({
        errors: [
          {
            msg: `You can only have one hometown. You will need to delete or edit the existing hometown.`,
          },
        ],
      });
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
    const { name } = req.body;

    await db.createHometown(user.profile.placesLived.id, {
      name,
    });

    return res.json({ message: "hometown created" });
  },
];

const hometownPut = [
  getUser,
  profileEditAuth,
  getHometown,
  validateCity,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const { name } = req.body;

    await db.updateCity(req.hometown.id, {
      name,
    });

    return res.json({ message: "hometown updated" });
  },
];

const hometownDelete = [
  getUser,
  profileEditAuth,
  getHometown,
  async (req, res) => {
    await db.deleteCity(req.hometown.id);

    return res.json({ message: "hometown deleted" });
  },
];

const currentCityPost = [
  getUser,
  profileEditAuth,
  async (req, res, next) => {
    const currentCity = await db.getUsersCurrentCity(req.user.id);
    if (currentCity) {
      return res.status(400).json({
        errors: [
          {
            msg: `You can only have one current city. You will need to delete or edit the existing current city.`,
          },
        ],
      });
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
    const { name } = req.body;

    await db.createCurrentCity(user.profile.placesLived.id, {
      name,
    });

    return res.json({ message: "current city created" });
  },
];

const currentCityPut = [
  getUser,
  profileEditAuth,
  getCurrentCity,
  validateCity,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const { name } = req.body;

    await db.updateCity(req.currentCity.id, {
      name,
    });

    return res.json({ message: "current city updated" });
  },
];

const currentCityDelete = [
  getUser,
  profileEditAuth,
  getCurrentCity,
  async (req, res) => {
    await db.deleteCity(req.currentCity.id);

    return res.json({ message: "current city deleted" });
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
  schoolPost,
  schoolPut,
  schoolDelete,
  placesLivedGet,
  cityPost,
  cityPut,
  cityDelete,
  hometownPost,
  hometownPut,
  hometownDelete,
  currentCityPost,
  currentCityPut,
  currentCityDelete,
};
