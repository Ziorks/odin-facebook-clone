const db = require("../db/queries");

const allUsersGet = async (req, res) => {
  const users = await db.getAllUsers();

  return res.json({ users });
};

const userGet = async (req, res) => {
  const { userId } = req.params;

  const user = await db.getUserWithProfile(+userId);
  if (req.user.id === +userId) {
    return res.json({ user });
  }

  const friendship = await db.getFriendshipByUserIds(req.user.id, +userId);
  return res.json({ user, friendship });
};

module.exports = { allUsersGet, userGet };
