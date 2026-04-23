const express = require("express");
const authController = require("../controllers/authController.js");

const router = express.Router();

router.post("/signup", authController.signupUser);
router.post("/login", authController.loginUser);

module.exports = router;
