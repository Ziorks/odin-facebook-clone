const { Router } = require("express");
const {
  friendsGet,
  pendingRequestsGet,
  requestPost,
  requestAcceptPost,
  friendRemovePost,
} = require("../controllers/friendshipController");

const router = Router();

router.get("/friends", friendsGet); //get current users friends
router.get("/pending", pendingRequestsGet); //get current users pending friend requests (both sent and recieved)
router.post("/request", requestPost); //create friend request
router.post("/accept", requestAcceptPost); //accept friend request
router.post("/remove", friendRemovePost); //deny friend request/delete friend

module.exports = router;
