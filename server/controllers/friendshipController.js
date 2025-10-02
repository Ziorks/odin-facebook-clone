const db = require("../db/queries");

const friendsGet = async (req, res) => {
  //get current users friends
  const { user } = req;

  const friendships = await db.getUsersFriends(user.id);
  const friends = friendships.map((friendship) => {
    const { user1Id, user1, user2 } = friendship;
    return user1Id === user.id ? user2 : user1;
  });

  return res.json({ friends });
};

const pendingRequestsGet = async (req, res) => {
  //get current users pending friend requests (both sent and recieved)
  const id = req.user.id;

  const friendships = await db.getUsersFriends(id, { pending: true });
  const pendingFriends = friendships.map((friendship) => {
    const { user2Id, user1, user2 } = friendship;
    const isSender = user2Id === id;
    const user = isSender ? user1 : user2;
    return { user, isSender };
  });

  return res.json({ pendingFriends });
};

const requestPost = async (req, res) => {
  //create friend request
  const { user } = req;
  const { userId } = req.body;

  if (user.id === userId) {
    return res
      .status(403)
      .json({ message: "you can't send a friend request to yourself" });
  }

  let friendship = await db.getFriendshipByUserIds(user.id, userId);
  if (friendship) {
    const message = friendship.accepted
      ? "you are already friends"
      : "a request already exists";
    return res.status(403).json({ message });
  }

  friendship = await db.createFriendship(user.id, userId);
  return res.json({ message: "friend request created", friendship });
};

const requestAcceptPost = async (req, res) => {
  //accept friend request
  const { id } = req.body;

  let friendship = await db.getFriendshipById(id);
  if (!friendship.user2Id === id) {
    return res.status(403).json({
      message:
        "you can't accept a friend request which you are not the recipient of",
    });
  }
  friendship = await db.updateFriendship(id, { accepted: true });
  return res.json({ message: "friendship accepted", friendship });
};

const friendRemovePost = async (req, res) => {
  //deny friend request/delete friend
  const { user } = req;
  const { id } = req.body;

  let friendship = await db.getFriendshipById(id);
  if (!(friendship.user1Id === user.id || friendship.user2Id === user.id)) {
    return res
      .status(403)
      .json({ message: "you can't remove someone elses friend" });
  }
  friendship = await db.deleteFriendship(id);
  return res.json({ message: "friendship deleted", friendship });
};

module.exports = {
  friendsGet,
  pendingRequestsGet,
  requestPost,
  requestAcceptPost,
  friendRemovePost,
};
