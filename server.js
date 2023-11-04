const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const connectDB = require("./config/db.js");
dotenv.config({ path: "./config/config.env" });

// CONFIG
// load env
const bootcamps = require("./routes/bootcamps.js");
// connect to db
connectDB();
// PORT config
const PORT = process.env.PORT || 5000;

// CREATE APP
const app = express();

// body parser
app.use(express.json());

// Route files
app.use("/api/v1/bootcamps", bootcamps);

// dev loggin middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const server = app.listen(
  PORT,
  console.log(`Server is running or port: ${PORT}`.yellow.bold)
);

// Handle unhandled rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exist process
  server.close(() => process.exit(1));
});
