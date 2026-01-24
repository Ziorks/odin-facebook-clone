const db = require("../db/queries");

const likeDelete = async (req, res) => {
  //Delete a like
  const { likeId } = req.params;

  const like = await db.getLike(+likeId);
  if (!like) {
    return res.status(404).json({ message: "like not found" });
  }

  await db.deleteLike(like.id);

  return res.json({ message: "like deleted" });
};

module.exports = { likeDelete };
