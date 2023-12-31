const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middlware/async.js");
const sendEmail = require("../utils/sendEmail.js");
const User = require("../models/User.js");

// @desc        Register user
// @route       GET /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
  const {name, email, password, role} = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Create token
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token,
  });
});

// @desc        Login user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
  const {email, password} = req.body;
  // console.log(email, password);

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await User.findOne({email}).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  // res.cookie("token", "none", {
  //       expires: new Date(Date.now() + 10 * 1000),
  //       httpOnly: true,
  //     },
  // );

  const options = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("token", "none", options).json({
    success: true,
    data: {},
  });
});

// @desc        Get current logged in user
// @route       POST /api/v1/auth/me
// @access
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({email: req.body.email});

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({validateBeforeSave: false});

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
      "host")}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \\n\\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });

    res.status(200).json({
      success: true,
      data: "Email sent",
    });
  } catch (e) {
    console.log(e);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({validateBeforeSave: false});

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc        Reset password
// @route       POST /api/v1/auth/resetpassword/:resettoken
// @access
exports.resetPassword = asyncHandler(async (req, res, next) => {
  console.log("resetpassword reached: ", req.params.resettoken);
  // Get hashed token
  const resetPasswordToken = crypto.createHash("sha256").
      update(req.params.resettoken).
      digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  console.log("found a user");

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: "ok",
  });
  // sendTokenResponse(user, 200, res);
});

// @desc        Update user details
// @route       POST /api/v1/auth/updatedetails
// @access
exports.updateDetails = asyncHandler(async (req, res, next) => {
  // only CAN update this fields
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc        Update password
// @route       POST /api/v1/auth/updatepassword
// @access
exports.updatePassword = asyncHandler(async (req, res, next) => {
  console.log("update password reached");
  const user = await User.findById(req.user.id).select("+password");

  // check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // in ms
    httpOnly: true,
  };

  // add secure - send with HTTPS
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  // cookie ("name", data, time_to_live)
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};