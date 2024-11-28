const express = require("express");
const router = express.Router();
const generalController = require("../controllers/general-controller");

router.get("/projects-list", generalController.projectsList);
router.get("/logs/:projectName", generalController.logs);
router.post("/flush-logs", generalController.flushLogs);
router.post("/git-pull", generalController.gitPull);
router.post("/change-status", generalController.changeStatus);

module.exports = router;