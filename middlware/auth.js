const jwt = require("jsonwebtoken");
const asyncHandler = require("./async.js");
const ErrorResponse = require("../utils/errorResponse.js");
const User = require("../models/User.js");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")) {
    // set token from Bearer token
    token = req.headers.authorization.split(" ")[1];
  }
  // set token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse(`Not authorize to access this route `, 401));
  }

  try {
    // Verify token (token co chua id cua nguoi dung)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // add user to req (forward to the next middleware)
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
          new ErrorResponse(
              `User role ${req.user.role} is not authorized to access this route`,
              403,
          ),
      );
    }
    next();
  };
};
