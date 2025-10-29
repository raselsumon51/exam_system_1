// library imports
const express = require("express");
const session = require("express-session");
const path = require("path");
const { MongoClient } = require("mongodb"); // Use MongoDB driver
const expressLayouts = require("express-ejs-layouts");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const  {connectToDB} = require("./connection/db");




// env variables
const port = process.env.PORT; // Use environment variable for port
const DATABASE_URL = process.env.DATABASE_URL;


// create main app
const app = express();
app.use(express.urlencoded({ extended: true }));


// Middleware 
app.use(expressLayouts);
app.use(express.static("public"));
app.use(fileUpload());
app.use(express.json());

// configurations
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/layout");

// Session configuration
app.use(
  session({
    secret: "ljfkfkkrkririejdbc",
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false, maxAge: 14 * 24 * 60 * 60 * 1000 }, // 7 days
    // MongoStore logic will be updated in the future if needed
  })
);

// Set session data to be available globally
// set totalQuestions = 0 by default
app.use(function (req, res, next) {
  res.locals.session = req.session;
  req.session.totalQuestions = req.session.totalQuestions || 0;
  // userId
  res.locals.userId = req.session.userId || null;
  res.locals.email = req.session.email || null;
  res.locals.role = req.session.role || null;
  next();
});

// Define routes
const routes = require("./routes/Routes");
const { error } = require("console");

// Use Routes
app.use("/", routes);


// Global Error Handling Middleware
// app.use((err, req, res, next) => {
//   // console.error(err);
//   // const statusCode = err.statusCode || 500;
//   // res.status(statusCode).json({
//   //   err
//   //   // error: {
//   //   //   message: err.message || "Internal Server Error",
//   //   //   path: req.path,
//   //   // },
//   // });
//   res.send(err)
// });

// Database connection
const connectDB = async () => {
  try {
    const db = await connectToDB(); // Get the db instance
    const collection = db.collection("exam_system"); 
    // Save the db instance globally if needed
    app.locals.db = db;

    return db;
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

  connectDB().then(() => {
  app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
});

// // const port = 3000;
// // const DATABASE_URL = "your_database_url_here"; // Replace with actual MongoDB URL
// const DATABASE_NAME = "exam_system"; // Database name

// // Connect to MongoDB before starting the server
// MongoClient.connect("mongodb+srv://raselsumon51:enPAmPa3oRxTsOCW@cluster0.nngte0p.mongodb.net/attendance?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(client => {
//     const db = client.db(DATABASE_NAME); // Get the db instance
//     console.log("Database connected successfully");

   
//     // Start the server once the database is connected
//     app.listen(port, () => {
//       console.log(`Server running at http://localhost:${port}`);
//     });
//   })
//   .catch(error => {
//     console.error("Database connection error:", error);
//     process.exit(1); // Exit if the database connection fails
//   });
