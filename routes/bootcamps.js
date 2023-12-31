const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampWithinRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps.js");

const Bootcamp = require("../models/Bootcamp.js");

// include other resourse router
const coursesRouter = require("./courses.js");
const reviewsRouter = require("./reviews.js");

const router = express.Router();

const advancedResults = require("../middlware/advancedResults.js");
const {protect, authorize} = require("../middlware/auth.js");

// re-route into other resource routers
router.use("/:bootcampId/courses", coursesRouter);
router.use("/:bootcampId/reviews", reviewsRouter);

// no need ID
router.route("/").
    get(advancedResults(Bootcamp, "courses"), getBootcamps).
    post(protect, authorize("publisher", "admin"), createBootcamp);

// need ID
router.route("/:id").
    get(getBootcamp).
    put(protect, authorize("publisher", "admin"), updateBootcamp).
    delete(protect, authorize("publisher", "admin"), deleteBootcamp);

//
router.route("/:id/photo").
    put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

//
router.route("/radius/:zipcode/:distance").get(getBootcampWithinRadius);

module.exports = router;
