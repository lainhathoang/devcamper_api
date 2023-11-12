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
const advancedResults = require("../middlware/advancedResults.js");

// include other resourse router
const coursesRouter = require("./courses.js");

const router = express.Router();

// re-route into other resource routers
router.use("/:bootcampId/courses", coursesRouter);

// no need ID
router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(createBootcamp);

// need ID
router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

//
router.route("/radius/:zipcode/:distance").get(getBootcampWithinRadius);

//
router.route("/:id/photo").put(bootcampPhotoUpload);

module.exports = router;
