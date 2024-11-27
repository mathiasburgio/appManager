const express = require("express");
const router = express.Router();
const nginxController = require("../controllers/nginx-controller");

router.get("/nginx/get-file/:domain", nginxController.getFile);

module.exports = router;