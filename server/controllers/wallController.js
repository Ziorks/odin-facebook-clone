const db = require("../db/queries");
const { wallExistsCheck, getPaginationQuery } = require("../middleware");
const { configureLikedByObject } = require("../utilities/helperFunctions");

const wallGet = [
  wallExistsCheck,
  getPaginationQuery,
  async (req, res) => {
    const { wallUser } = req;
    const { page, resultsPerPage } = req.pagination;
    const wall = await db.getWall(wallUser.id, { page, resultsPerPage });
    wall.results.forEach((post) => {
      const userId = req.user.id;
      configureLikedByObject(post, userId);
      if (post.comment) {
        configureLikedByObject(post.comment, userId);
        if (post.comment.reply) {
          configureLikedByObject(post.comment.reply, userId);
        }
      }
    });

    return res.json(wall);
  },
];

module.exports = {
  wallGet,
};
