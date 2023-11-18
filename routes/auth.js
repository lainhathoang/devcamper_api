const express = require("express");
const {register, login, getMe, forgotPassword} = require(
    "../controllers/auth.js");
const {protect} = require("../middlware/auth.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgotpassword", forgotPassword);

module.exports = router;