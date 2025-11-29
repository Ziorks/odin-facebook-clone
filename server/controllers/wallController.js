const db = require("../db/queries");
const { configureLikedByObject } = require("../utilities/helperFunctions");

const wallGet = async (req, res) => {
  const { wallId } = req.params;

  const wallExists = await db.getUserById(+wallId);
  if (!wallExists) {
    return res.status(404).json({ message: "wall not found" });
  }

  const wall = await db.getWall(+wallId);
  wall.forEach((post) => {
    const userId = req.user.id;
    configureLikedByObject(post, userId);
    if (post.comment) {
      configureLikedByObject(post.comment, userId);
      if (post.comment.reply) {
        configureLikedByObject(post.comment.reply, userId);
      }
    }
  });

  //TODO: remove this
  console.dir(wall, { depth: 5 });

  return res.json({ wall });
};

module.exports = { wallGet };
