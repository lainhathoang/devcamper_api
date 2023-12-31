const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const connectDB = require("./config/db");
const dotenv = require("dotenv");

// load env vars
dotenv.config({path: "./config/config.env"});

// load models
const Bootcamp = require("./models/Bootcamp.js");
const Course = require("./models/Course.js");
const User = require("./models/User.js");
const Review = require("./models/Review.js");

// connect db
connectDB();

// read JSON file
const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8"),
);
const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8"),
);
const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8"),
);
const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reviews.json`, "utf-8"),
);

// import into db
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);

    console.log("Data imported...".green.inverse);
    process.exit();
  } catch (err) {
    console.err(err);
  }
};

// delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log("Data destroyed...".red.inverse);
    process.exit();
  } catch (error) {
    console.err(error);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
