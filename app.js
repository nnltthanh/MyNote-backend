//this is the main app.js file that uses express, cors, morgan, and mongoose
//routes are here as well as connection to the database
const path = require("path");
const express = require("express");
const app = express();
//cors
const cors = require("cors");
app.use(cors());
//log api requests
const morgan = require("morgan");
//mongoose for mongodb
const mongoose = require("mongoose");
//jwt
const authjwt = require("./middlewares/authjwt");
//for .env file
require("dotenv/config");
//port and api
const port = process.env.PORT || 3000;
const api = process.env.API_URL;
//logging with log4js
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "info" || "error"; 

//middleware - express, morgan
app.use(express.json());
app.use(morgan("tiny"));

//CLOUD HOSTING 
//static files from the dist folder
app.use(express.static(path.join(__dirname + "/dist")));

//all requests will be routed to the vue app
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/dist/index.html"));
});


//routes declared here
const usersRoute = require("./routes/user.route");
const notesRoute = require("./routes/note.route");

//routes used
app.use(`${api}/user`, usersRoute);
//applying authjwt middleware to the proper routes
app.use(`${api}/note`, authjwt(), notesRoute);

//connect using connection string from .env file
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "noteapp",
  })
  .then(() => {
    //console.log("Database connection is ready");
    logger.info("Database connection established");
  })
  .catch((err) => {
    //console.log(err);
    logger.error("error connecting to database: " + err);
  });

//port of the api
app.listen(port, () => {
  logger.info("server is running");
});
