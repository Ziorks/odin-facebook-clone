const { Router } = require("express");
const {
  allUsersGet,
  userGet,
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
} = require("../controllers/userController");

const router = Router();

router.get("/", allUsersGet);
router.get("/:userId", userGet);

router.get("/:userId/about", aboutOverviewGet);
router.get("/:userId/about_overview", aboutOverviewGet);

router.get("/:userId/about_work_and_education", aboutWorkAndEducationGet);
router.post("/:userId/work", workPost);
router.route("/:userId/work/:workId").put(workPut).delete(workDelete);
router.post("/:userId/school", schoolPost);
router.route("/:userId/school/:schoolId").put(schoolPut).delete(schoolDelete);

router.get("/:userId/about_places_lived", placesLivedGet);
router.post("/:userId/city", cityPost);
router.route("/:userId/city/:cityId").put(cityPut).delete(cityDelete);

// router.get("/:userId/about_contact_info", contactInfoGet);
// router.get("/:userId/about_details", detailsAboutYouGet);

module.exports = router;
