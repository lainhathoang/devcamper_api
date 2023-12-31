const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middlware/async.js");
const Review = require("../models/Review.js");
const Bootcamp = require("../models/Bootcamp.js");

// @desc        Get reviews
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamps/:bootcampId/reviews
// @access      Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({bootcamp: req.params.bootcampId});

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc        Get a single review
// @route       GET /api/v1/reviews/:id
// @access      Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name",
  });

  if (!review) {
    return next(
        new ErrorResponse(`No review with the id of ${req.params.id}`, 404),
    );
  }

  res.status(200).json({success: true, data: review});
});

// @desc        Add a  review
// @route       POST /api/v1/bootcamps/:bootcampId/reviews
// @access      Public
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  // Add user to req.body (for review's user)
  req.body.user = req.user.id;

  const bootcamp = Bootcamp.findById(req.params.bootcampId);

  // check if bootcamp is existed
  if (!bootcamp) {
    return next(
        new ErrorResponse(
            `No bootcamp with the id of ${req.params.bootcampId}`,
            404,
        ),
    );
  }

  const review = Review.create(req.body);

  res.status(201).json({success: true, data: {}});
});

// @desc        Update a review
// @route       PUT /api/v1/review/:id
// @access      Public
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
        new ErrorResponse(
            `No review with the id of ${req.params.id}`,
            404,
        ),
    );
  }

  // Make sure review to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({success: true, data: review});
});

// @desc        Delete a review
// @route       DELETE /api/v1/review/:id
// @access      Public
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  // check if bootcamp is existed
  if (!review) {
    return next(
        new ErrorResponse(
            `No review with the id of ${req.params.id}`,
            404,
        ),
    );
  }

  // Make sure review to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  await review.deleteOne();

  res.status(200).json({success: true, data: {}});
});