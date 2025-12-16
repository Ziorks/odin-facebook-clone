const passport = require("passport");
const db = require("../db/queries");
const { configureLikedByObject } = require("../utilities/helperFunctions");

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

const getPost = async (req, res, next) => {
  const { postId } = req.params;

  const post = await db.getPost(+postId);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  configureLikedByObject(post, req.user.id);
  post.comments.forEach((comment) => {
    configureLikedByObject(comment, req.user.id);
  });

  req.post = post;
  return next();
};

const postEditAuth = (req, res, next) => {
  const userId = req.user.id;
  const authorId = req.post.author.id;

  if (userId !== authorId) {
    return res
      .status(403)
      .json({ message: "you are not authorized to edit this post" });
  }

  return next();
};

const getComment = async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await db.getComment(+commentId);
  if (!comment) {
    return res.status(404).json({ message: "comment not found" });
  }

  req.comment = comment;
  return next();
};

const commentEditAuth = async (req, res, next) => {
  const userId = req.user.id;
  const authorId = req.comment.author.id;

  if (userId !== authorId) {
    return res
      .status(403)
      .json({ message: "you are not authorized to edit this comment" });
  }

  return next();
};

const wallExistsCheck = async (req, res, next) => {
  const { wallId } = req.params;

  const wallExists = await db.getUserById(+wallId);
  if (!wallExists) {
    return res.status(404).json({ message: "wall not found" });
  }

  return next();
};

const getUser = async (req, res, next) => {
  const { userId } = req.params;

  const user = await db.getUserWithProfile(+userId);
  if (!user) {
    return res
      .status(404)
      .json({ message: `user with id:${userId} not found` });
  }

  req.paramsUser = user;
  return next();
};

const profileEditAuth = async (req, res, next) => {
  const user = req.paramsUser;

  if (req.user.id !== user.id) {
    return res
      .status(403)
      .json({ message: "you are not authorized to edit this profile" });
  }

  return next();
};

const getWork = async (req, res, next) => {
  const { workId } = req.params;
  const work = await db.getWork(+workId);
  if (!work) {
    return res
      .status(404)
      .json({ message: `work with id:${workId} not found` });
  }

  req.work = work;
  return next();
};

const getSchool = async (req, res, next) => {
  const { schoolId } = req.params;
  const school = await db.getSchool(+schoolId);
  if (!school) {
    return res
      .status(404)
      .json({ message: `school with id:${schoolId} not found` });
  }

  req.school = school;
  return next();
};

const getCity = async (req, res, next) => {
  const { cityId } = req.params;
  const city = await db.getCity(+cityId);
  if (!city) {
    return res
      .status(404)
      .json({ message: `city with id:${cityId} not found` });
  }

  req.city = city;
  return next();
};

const getHometown = async (req, res, next) => {
  const hometown = await db.getUsersHometown(req.user.id);
  if (!hometown) {
    return res
      .status(404)
      .json({ message: `user has no hometown associated with it` });
  }

  req.hometown = hometown;
  return next();
};

const getCurrentCity = async (req, res, next) => {
  const currentCity = await db.getUsersCurrentCity(req.user.id);
  if (!currentCity) {
    return res
      .status(404)
      .json({ message: `user has no current city associated with it` });
  }

  req.currentCity = currentCity;
  return next();
};

module.exports = {
  notFoundHandler,
  errorHandler,
  jwtAuth,
  getPost,
  postEditAuth,
  getComment,
  commentEditAuth,
  wallExistsCheck,
  getUser,
  profileEditAuth,
  getWork,
  getSchool,
  getCity,
  getHometown,
  getCurrentCity,
};
