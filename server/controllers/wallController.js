const db = require("../db/queries");
const { wallExistsCheck } = require("../middleware");
const { configureLikedByObject } = require("../utilities/helperFunctions");

const wallGet = [
  wallExistsCheck,
  async (req, res) => {
    const { wallId } = req.params;

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
  },
];

module.exports = {
  wallGet,
};
