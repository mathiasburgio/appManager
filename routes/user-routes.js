const express = require("express");
const router = express.Router();
const middlewares = require("../utils/middlewares");
const userController = require("../controllers/user-controller");

router.post("/user/login", middlewares.checkSpam, userController.login);
router.get("/user/logout", userController.logout);
router.get("/user/is-logged", userController.isLogged);

module.exports = router;