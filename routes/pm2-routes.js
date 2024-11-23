const express = require("express");
const router = express.Router();
const pm2Controller = require("../controllers/pm2-controller");

router.get("/pm2-get-all", pm2Controller.getAll);
router.get("/pm2-get-data", pm2Controller.getData);
router.get("/pm2-log", pm2Controller.log);
router.post("/pm2-create-process", pm2Controller.createProcess);
router.post("/pm2-change-status", pm2Controller.changeStatus);
router.post("/pm2-flush-log", pm2Controller.flushLog);

module.exports = router;