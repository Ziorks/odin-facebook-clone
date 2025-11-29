const { validationResult } = require("express-validator");
const db = require("../db/queries");
const { validateLike } = require("../utilities/validators");

const likePost = [
  validateLike,
  async (req, res) => {
    //Create a like
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "validation failed", errors: errors.array() });
    }

    const { targetId, targetType } = req.body;

    let target = null;
    switch (targetType) {
      case "POST":
        target = await db.getPost(targetId);
        break;
      case "COMMENT":
        target = await db.getComment(targetId);
        break;
      default:
        return res.status(500).json({
          message: `${targetType} is not handled in route controller`,
        });
    }
    if (!target) {
      return res.status(404).json({ message: "target not found" });
    }

    await db.createLike(req.user.id, targetId, targetType);

    return res.json({ message: "like created" });
  },
];

const likeDelete = async (req, res) => {
  //Delete a like
  //TODO: consider making the targetId a param
  const { targetId, targetType } = req.query;

  const like = await db.getLike(req.user.id, +targetId, targetType);
  if (!like) {
    return res.status(404).json({ message: "like not found" });
  }

  await db.deleteLike(like.id);

  return res.json({ message: "like deleted" });
};

module.exports = { likePost, likeDelete };
