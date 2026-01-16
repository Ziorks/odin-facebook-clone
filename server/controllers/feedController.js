const db = require("../db/queries");
const { getPaginationQuery } = require("../middleware");
const { configureLikedByObject } = require("../utilities/helperFunctions");

const feedGet = [
  getPaginationQuery,
  async (req, res) => {
    const userId = req.user.id;
    const { page, resultsPerPage } = req.pagination;
    const feed = await db.getUsersFeed(userId, { page, resultsPerPage });

    feed.feed.forEach((post) => {
      const userId = req.user.id;
      configureLikedByObject(post, userId);
      if (post.comment) {
        configureLikedByObject(post.comment, userId);
        if (post.comment.reply) {
          configureLikedByObject(post.comment.reply, userId);
        }
      }
    });

    return res.json(feed);
  },
];

module.exports = { feedGet };
