//this is the route for users to support logging in and registering 
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
//user authentication
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
//logging with log4js
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "info" || "error";

//REGISTER a new user
router.post("/register", async (req, res) => {
  //check if a user with this email already exists
  const findUserIfExists = await User.findOne({
    email: req.body.email,
  });
  //if a user has been found
  if (findUserIfExists != null) {
    logger.info("in register new user, email already exists");
    return res.status(409).send("A user with that email already exists");
  }
  //this is a new user
  else {
    //encrypt their password in the database
    let encryptedPassword = await bcrypt.hashSync(req.body.password);
    //create new users
    let user = new User({
      email: req.body.email,
      password: encryptedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    user = await user.save();

    //handle error if cannot be created
    if (!user) {
      logger.error("ERROR in register new user, cannot be created");
      return res.status(400).send("the user cannot be created");
    }
     //success - new user has been created/registered
     logger.info("SUCCESS - new user registered");
    res.send(user);
  }
});

//LOGIN an existing user
router.post(`/login`, async (req, res) => {
  //find the user by their email
  const user = await User.findOne({
    email: req.body.email,
  });
  //generate a secret using the key
  const secret = process.env.TOKEN_KEY;

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    //generate user token using JWT and the userId, expires in 30 days
    const token = jwt.sign(
      {
        userId: user.id,
      },
      secret,
      { expiresIn: "30d" }
    );
    //success: authenticated user here
    logger.info("SUCCESS - user logged in ");
    res.status(200).send({ user: user.email, token: token, userId: user.id });
  } else {
    //email or password incorrect
    logger.info("in login: users email or password is incorrect ");
    res.status(400).send("email or password incorrect");
  }
});

//below are not currently being used but might in future releases

//UPDATE/PUT existing user
/* router.put("/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    },
    { new: true }
  );
  if (!user) {
    return res.status(400).send("the user cannot be updated");
  }
  res.send(user);
});

//DELETE by ID
router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "the user has been deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });

    //get user by ID
router.get(`/:id`, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(500).json({ message: "User with the given ID not found" });
  }
  res.status(200).send(user);
}); 
}); */

module.exports = router;
