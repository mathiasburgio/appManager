const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project-controller");

router.get("/projects/get-list", projectController.getList);
router.post("/projects/create", projectController.create);
router.post("/projects/update-actions", projectController.updateActions);
router.post("/projects/delete-one", projectController.deleteOne);

module.exports = router;