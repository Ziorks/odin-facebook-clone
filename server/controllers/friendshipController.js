const { getFriendship, getPaginationQuery } = require("../middleware");
const db = require("../db/queries");

const friendsGet = [
  getPaginationQuery,
  async (req, res) => {
    //get current users friends
    const { page, resultsPerPage } = req.pagination;

    const friendships = await db.getUsersFriends(req.user.id, {
      pending: false,
      page,
      resultsPerPage,
    });

    return res.json(friendships);
  },
];

const incomingPendingRequestsGet = async (req, res) => {
  //get current users incoming pending friend requests
  const requests = await db.getUsersIncomingFriendRequests(req.user.id);

  return res.json({ requests });
};

const outgoingPendingRequestsGet = async (req, res) => {
  //get current users outgoing pending friend requests
  const requests = await db.getUsersOutgoingFriendRequests(req.user.id);

  return res.json({ requests });
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

const requestAcceptPut = [
  getFriendship,
  async (req, res) => {
    //accept friend request
    const { user, friendship } = req;

    if (friendship.user2Id !== user.id) {
      return res.status(403).json({
        message:
          "you can't accept a friend request which you are not the recipient of",
      });
    }
    const updatedFriendship = await db.updateFriendship(friendship.id, {
      accepted: true,
    });
    return res.json({
      message: "friendship accepted",
      friendship: updatedFriendship,
    });
  },
];

const friendshipDelete = [
  getFriendship,
  async (req, res) => {
    //deny friend request/delete friend
    const { user, friendship } = req;

    if (!(friendship.user1Id === user.id || friendship.user2Id === user.id)) {
      return res
        .status(403)
        .json({ message: "you can't remove someone elses friend" });
    }
    await db.deleteFriendship(friendship.id);
    return res.json({ message: "friendship deleted", friendship });
  },
];

module.exports = {
  friendsGet,
  incomingPendingRequestsGet,
  outgoingPendingRequestsGet,
  requestPost,
  requestAcceptPut,
  friendshipDelete,
};
