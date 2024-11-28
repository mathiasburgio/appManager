const express = require("express");
const router = express.Router();
const middlewares = require("../utils/middlewares");
const userController = require("../controllers/user-controller");

router.post("/user/login", middlewares.checkSpam, userController.login);
router.get("/user/logout", middlewares.checkSpam, userController.logout);
router.get("/user/is-logged", middlewares.checkSpam, userController.isLogged);

module.exports = router;