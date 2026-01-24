const db = require("../db/queries");
const { getPaginationQuery } = require("../middleware");
const { attachMyLikesToPost } = require("../utilities/helperFunctions");

const feedGet = [
  getPaginationQuery,
  async (req, res) => {
    const userId = req.user.id;
    const { page, resultsPerPage } = req.pagination;

    const feed = await db.getUsersFeed(userId, { page, resultsPerPage });
    await Promise.all(
      feed.results.map(async (post) => attachMyLikesToPost(post, req.user.id)),
    );

    return res.json(feed);
  },
];

module.exports = { feedGet };
