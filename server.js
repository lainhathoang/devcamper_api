const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.js");
const errorHandler = require("./middlware/error.js");

// load env
dotenv.config({path: "./config/config.env"});
// CONFIG routes
const bootcamps = require("./routes/bootcamps.js");
const courses = require("./routes/courses.js");
const auth = require("./routes/auth.js");
const logger = require("./middlware/logger.js");
// connect to db
connectDB();
// PORT config
const PORT = process.env.PORT || 5000;

// CREATE APP
const app = express();

// body parser
app.use(express.json());
// file uploading
app.use(fileupload());
// cookie parser
app.use(cookieParser());
// dev loggin middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set static folder
app.use(express.static(path.join(__dirname, "public")));


// Route files
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);

app.use(errorHandler);



const server = app.listen(
    PORT,
    console.log(`Server is running or port: ${PORT}`.yellow.bold),
);

// Handle unhandled rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exist process
  server.close(() => process.exit(1));
});
