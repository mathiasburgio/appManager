const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project-controller");

router.get("/project/get-list", projectController.getList);
router.post("/project/create", projectController.create);
//router.post("/project/update-actions", projectController.updateActions);
router.post("/project/delete-one", projectController.deleteOne);

module.exports = router;