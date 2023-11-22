const express = require("express");
const {getReviews, getReview, addReview, updateReview, deleteReview} = require(
    "../controllers/reviews.js");

const Review = require("../models/Review.js");
const advancedResults = require("../middlware/advancedResults.js");
const {protect, authorize} = require("../middlware/auth.js");

const router = express.Router({mergeParams: true});

router.route("/").
    get(advancedResults(Review), getReviews).
    post(protect, authorize("user", "admin"), addReview);

router.route("/:id").
    get(advancedResults(Review), getReview).
    put(protect, authorize("user", "admin"), updateReview).
    delete(protect, authorize("user", "admin"), deleteReview);

module.exports = router;