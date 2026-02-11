const { Router } = require("express");
const {
  usersSearch,
  userGet,
  userPut,
  aboutOverviewGet,
  aboutWorkAndEducationGet,
  workPost,
  workPut,
  workDelete,
  schoolPost,
  schoolPut,
  schoolDelete,
  placesLivedGet,
  cityPost,
  cityPut,
  cityDelete,
  contactInfoGet,
  contactInfoPut,
  detailsGet,
  detailsPut,
  friendsGet,
  wallGet,
} = require("../controllers/userController");

const router = Router();

router.get("/search", usersSearch);
router.route("/:userId").get(userGet).put(userPut);

router.get("/:userId/about_overview", aboutOverviewGet);

router.get("/:userId/about_work_and_education", aboutWorkAndEducationGet);
router.post("/:userId/work", workPost);
router.route("/:userId/work/:workId").put(workPut).delete(workDelete);
router.post("/:userId/school", schoolPost);
router.route("/:userId/school/:schoolId").put(schoolPut).delete(schoolDelete);

router.get("/:userId/about_places_lived", placesLivedGet);
router.post("/:userId/city", cityPost);
router.route("/:userId/city/:cityId").put(cityPut).delete(cityDelete);

router
  .route("/:userId/about_contact_info")
  .get(contactInfoGet)
  .put(contactInfoPut);

router.route("/:userId/about_details").get(detailsGet).put(detailsPut);

router.get("/:userId/friends", friendsGet);

//TODO: add a wall post, post route
router.get("/:userId/wall", wallGet);

module.exports = router;
