const { Router } = require("express");
const {
  friendsGet,
  incomingPendingRequestsGet,
  outgoingPendingRequestsGet,
  requestPost,
  requestAcceptPut,
  friendshipDelete,
} = require("../controllers/friendshipController");

const router = Router();

router.get("/friends", friendsGet); //get current users friends
router.get("/pending/incoming", incomingPendingRequestsGet); //get current users incoming pending friend requests
router.get("/pending/outgoing", outgoingPendingRequestsGet); //get current users outgoing pending friend requests
router.post("/request", requestPost); //create friend request
router.put("/:friendshipId/accept", requestAcceptPut); //accept friend request
router.delete("/:friendshipId/remove", friendshipDelete); //deny friend request/delete friend

module.exports = router;
