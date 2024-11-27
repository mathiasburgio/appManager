const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project-controller");

router.get("/project/get-all", projectController.getList);
router.get("/project/get-one", projectController.getOne);
router.post("/project/create", projectController.create);
router.post("/project/update-one", projectController.updateOne);
router.post("/project/installDependencies", projectController.installDependencies);

module.exports = router;