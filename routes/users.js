const express = require("express");
const {
  getUsers, getUser, createUser, updateUser, deleteUser,
} = require("../controllers/users.js");

const User = require("../models/User.js");

const router = express.Router();

const advancedResults = require("../middlware/advancedResults.js");
const {protect, authorize} = require("../middlware/auth.js");

router.use(protect);
router.use(authorize("admin"));

// no need ID
router.route("/").
    get(advancedResults(User), getUsers).
    post(createUser);

// need ID
router.route("/:id").
    get(getUser).
    put(updateUser).
    delete(deleteUser);

module.exports = router;
