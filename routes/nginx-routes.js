const express = require("express");
const router = express.Router();
const nginxController = require("../controllers/nginx-controller");

router.get("/nginx/files-list", nginxController.getFilesList);
router.get("/nginx/read-file/:domain", nginxController.readFile);
router.get("/nginx/default-script", nginxController.defaultScript);


module.exports = router;