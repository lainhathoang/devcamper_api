const path = require("path");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middlware/async.js");
const geocoder = require("../utils/geocoder.js");
const Bootcamp = require("../models/Bootcamp.js");

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
  // return next(new ErrorResponse(`deo co loi`, 400));
});

// @desc        Get a bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  // Mongoose bad ObjectId
  if (!bootcamp) {
    return next(
        new ErrorResponse(`Resourse not found with id of ${req.params.id}`,
            404),
    );
  }

  res.status(200).json({success: true, data: bootcamp});
});

// @desc        Create a bootcamp
// @route       POST /api/v1/bootcamps
// @access      Public
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user'id to req.body
  req.body.user = req.user.id;

  // Check for published bootcamp (1 bootcamp / publisher)
  const publishedBootcamp = await Bootcamp.findOne({user: req.user.id});

  // If number of bootcamp of a publisher = 1 => block
  // Only admin can add more than 1 bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
        new ErrorResponse(
            `The user with ID ${req.user.id} has already published a bootcamp`,
            400,
        ),
    );
  }

  // only add the fields in the Schema
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({success: true, data: bootcamp});
});

// @desc        Update a bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  // Check if the bootcamp is existed
  if (!bootcamp) {
    return next(
        new ErrorResponse(`Resource not found with id of ${req.params.id}`,
            404),
    );
  }

  // Check permission (Only owner & admin can update)
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
        new ErrorResponse(
            `User ${req.params.id} is not authorized to update this bootcamp`,
            401,
        ),
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({success: true, data: bootcamp});
});

// @desc        Delete a bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  // check if the bootcamp is existed
  if (!bootcamp) {
    return next(
        new ErrorResponse(`Resource not found with id of ${req.params.id}`,
            404),
    );
  }

  // Check permission (Only owner & admin can update)
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
        new ErrorResponse(
            `User ${req.params.id} is not authorized to update this bootcamp`,
            401,
        ),
    );
  }

  await bootcamp.deleteOne();

  res.status(200).json({success: true, data: {}});
});

// @desc        Get a bootcamp within radius
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private
exports.getBootcampWithinRadius = asyncHandler(async (req, res, next) => {
  const {zipcode, distance} = req.params;

  // Get lat/long from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divine dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {$centerSphere: [[lng, lat], radius]},
    },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc        Upload photo for bootcamp
// @route       PUT /api/v1/bootcamps/:id/photo
// @access      Public
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  // check if the bootcamp is existed
  if (!bootcamp) {
    return next(
        new ErrorResponse(`Resource not found with id of ${req.params.id}`,
            404),
    );
  }

  // Check permission (Only owner & admin can update)
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
        new ErrorResponse(
            `User ${req.params.id} is not authorized to update this bootcamp`,
            401,
        ),
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  // get the uploaded file
  const file = req.files.file;

  // check the file is a real photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check file size
  if (file.size > process.env.FILE_UPLOAD_PATH) {
    return next(
        new ErrorResponse(
            `Please upload an image less than ${process.env.FILE_UPLOAD_PATH}`,
            400,
        ),
    );
  }

  // set NEW custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  // update
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    // update the file.name
    await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

    res.status(200).json({success: true, data: file.name});
  });
});
