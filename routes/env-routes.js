const express = require("express");
const router = express.Router();
const envController = require("../controllers/env-controller");

//router.get("/env-clonar-example", envController.clonarExample);
router.get("/env-read", envController.read);
router.get("/env-write", envController.write);

module.exports = router;