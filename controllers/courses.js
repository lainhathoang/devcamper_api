const ErrorHandler = require("../utils/errorResponse.js");
const asyncHandler = require("../middlware/async.js");
const Course = require("../models/Course.js");
const ErrorResponse = require("../utils/errorResponse.js");
const Bootcamp = require("../models/Bootcamp.js");

// @desc        Get all courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamps/:bootcampsId/courses
// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    // /bootcamps/bootcampId/courses

    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    // /courses
    return res.status(200).json(res.advancedResults);
  }

});

// @desc        Get a single course
// @route       GET /api/v1/courses/:id
// @access      Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      new ErrorResponse(`No courses with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: course });
});

// @desc        Add a bootcamp
// @route       POST /api/v1/bootcamps/:bootcampId/courses
// @access      Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(201).json({ success: true, data: {} });
});

// @desc        Update a bootcamp
// @route       PUT /api/v1/courses/:id
// @access      Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: course });
});

// @desc        Delete a bootcamp
// @route       DELETE /api/v1/courses/:id
// @access      Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  try {
    await course.deleteOne();
  } catch (error) {
    console.error(error);
  }

  res.status(200).json({ success: true, data: {} });
});
