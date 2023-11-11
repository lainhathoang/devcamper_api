const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampWithinRadius,
} = require("../controllers/bootcamps.js");

// include other resourse router
const coursesRouter = require("./courses.js");

const router = express.Router();

// re-route into other resource routers
router.use("/:bootcampId/courses", coursesRouter);

// no need ID
router.route("/").get(getBootcamps).post(createBootcamp);

// need ID
router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

//
router.route("/radius/:zipcode/:distance").get(getBootcampWithinRadius);

module.exports = router;
