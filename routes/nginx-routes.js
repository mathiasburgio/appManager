const express = require("express");
const router = express.Router();
const nginxController = require("../controllers/nginx-controller");

router.get("/nginx-crear-proyecto", nginxController.crearProyecto);
router.get("/nginx-leer", nginxController.leer);
router.get("/nginx-escribir", nginxController.escribir);
router.get("/nginx-verificar-integridad", nginxController.verificarIntegridad);
router.get("/nginx-verificar-estado", nginxController.verificarEstado);
router.get("/nginx-iniciar", nginxController.iniciar);
router.get("/nginx-reiniciar", nginxController.reiniciar);

module.exports = router;