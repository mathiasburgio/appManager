const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");

router.post("/user/login", userController.login);
router.get("/user/logout", userController.logout);
router.get("/user/isLogged", userController.isLogged);

module.exports = router;