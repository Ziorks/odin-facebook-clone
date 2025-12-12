const { Router } = require("express");
const {
  allUsersGet,
  userGet,
  aboutOverviewGet,
  aboutWorkAndEducationGet,
  workPost,
  workPut,
  workDelete,
} = require("../controllers/userController");

const router = Router();

router.get("/", allUsersGet);
router.get("/:userId", userGet);
router.get("/:userId/about", aboutOverviewGet);
router.get("/:userId/about_overview", aboutOverviewGet);
router.get("/:userId/about_work_and_education", aboutWorkAndEducationGet);
router.post("/:userId/work", workPost);
router.route("/:userId/work/:workId").put(workPut).delete(workDelete);

module.exports = router;
