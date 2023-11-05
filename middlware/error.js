const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  // => ?????
//   console.log("1. ", err.errors);
  //   error.message = err.message // append them message vi error chua copy dc message
  //   console.log("1.1 ", error);

  // log to console for dev
  //   console.log(err.stack.red);

  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
    // console.log("2. ", error);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate filed value entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server error",
  });
};

module.exports = errorHandler;
