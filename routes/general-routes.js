const express = require("express");
const router = express.Router();
const middlewares = require("../utils/middlewares");
const generalController = require("../controllers/general-controller");

router.get("/general/projects-list", middlewares.checkUser, generalController.projectsList);
router.get("/general/logs/:projectName", middlewares.checkUser, generalController.logs);
router.post("/general/flush-logs", middlewares.checkUser, generalController.flushLogs);
router.post("/general/git-pull", middlewares.checkUser, generalController.gitPull);
router.post("/general/change-status", middlewares.checkUser, generalController.changeStatus);

module.exports = router;