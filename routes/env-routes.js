const express = require("express");
const router = express.Router();
const envController = require("../controllers/env-controller");

router.get("/env-clonar-example", envController.clonarExample);
router.get("/env-leer", envController.leer);
router.get("/env-escribir", envController.escribir);

module.exports = router;