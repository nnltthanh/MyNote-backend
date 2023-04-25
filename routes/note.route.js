//this is the route for notes to support basic CRUD operations
const { Note } = require("../models/note");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const { DateTime } = require("luxon");
const mongoose = require("mongoose");
//logging with log4js
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "info" || "error";

//GET all notes BY User ID
router.get(`/getByUserId/:id`, async (req, res) => {
  //parameter
  const userID = req.params.id;

  //verify that the user exists, if not found throw error
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      logger.error("ERROR in get notes by userId, user not found");
      return res
        .status(404)
        .send(
          "Notes by user ID not found because user account was unable to be located"
        );
    }
    //user has been found at this point, find the entries by their ID, if list not found, throw error
    const noteList = await Note.find({
      user: mongoose.Types.ObjectId(userID),
    });
    if (!noteList) {
      logger.error(
        "ERROR in get notes by userId, notes not found"
      );
      res.status(500).json({ success: false });
    }
    //success - return the list of notes
    logger.info("SUCCESS - notes found");
    res.send(noteList);
  } catch (error) {
    logger.error("ERROR in get notes by userId: " + error);
    res.status(500).send("Server error");
  }
});

//GET note BY ID BY User ID
router.get(`/byEntryId/:userId/:entryId`, async (req, res) => {
  //parameters
  const userID = req.params.userId;
  const entryID = req.params.entryId;

  //verify that the user exists, if not found return error
  const user = await User.findById(userID);
  if (!user) {
    logger.error("ERROR in get note by id by userId, user not found");
    return res
      .status(404)
      .json({
        message:
          "Note with the given ID cannot be found because user account was unable to be located",
      });
  }

  //verify that note with the given id exists, if not then return error
  const note = await Note.findById(entryID);
  if (!note) {
    logger.error(
      "ERROR in get note by id by userId, note with given ID not found"
    );
    return res
      .status(500)
      .json({ message: "Note with the given ID not found" });
  }
  //success - return note
  logger.info("SUCCESS - note found: " + note);
  return res.status(200).send(note);
});

//UPDATE/PUT existing note
router.put(`/update/:userId/:entryId`, async (req, res) => {
  //parameters
  const userID = req.params.userId;
  const entryID = req.params.entryId;

  //verify that the user exists, if not found return error
  const user = await User.findById(userID);
  if (!user) {
    logger.error("ERROR in update note, user not found");
    return res
      .status(404)
      .json({
        message:
          "Note with the given ID cannot be updated because user account was unable to be located",
      });
  }

  //user found, find the entry by ID and update
  const note = await Note.findByIdAndUpdate(
    entryID,
    {
      title: req.body.title,
      entryBody: req.body.entryBody,
      entryDate: req.body.entryDate,
      mood: req.body.mood,
    },
    { new: true }
  );

  //verify that note with the given id exists and can be updated, if not then return error
  if (!note) {
    logger.error("ERROR in update note, cannot be updated");
    return res.status(400).send("the note cannot be updated");
  }
  //success - return updated note
  logger.info("SUCCESS - note updated: " + note);
  res.send(note);
});

//POST/CREATE a new note
router.post("/create/:id", async (req, res) => {
  //the date of the note upon its creation is stored as an ISO
  const dt = DateTime.now();
  const noteDate = dt.toISO();

  //parameter
  const userID = req.params.id;

  //verify that the user exists, if not found return error
  const user = await User.findById(userID);
  if (!user) {
    logger.error("ERROR in create note, user not found");
    return res
      .status(404)
      .json({
        message:
          "Note cannot be created because user account was unable to be located",
      });
  }

  //user has been found, create the new note
  let note = new Note({
    user: user,
    title: req.body.title,
    entryBody: req.body.entryBody,
    entryDate: noteDate,
    mood: req.body.mood,
  });
  note = await note.save();

  //verify that note was created, if not then return error
  if (!note) {
    logger.error("ERROR in create note, cannot be created");
    return res.status(400).send("the note cannot be created");
  }

  //success - return created note
  logger.info("SUCCESS - note created: " + note);
  res.send(note);
});

//DELETE entry BY ID
router.delete("/delete/:id", (req, res) => {
  //find note by ID and remove
  Note.findByIdAndRemove(req.params.id)
    .then((note) => {
      //if entry was found, return success message
      if (note) {
        logger.info("SUCCESS - note deleted: " + note);
        return res
          .status(200)
          .json({
            success: true,
            message: "the note has been deleted",
          });
      } else {
        //error has occurred
        logger.error("ERROR in delete note, cannot be deleted");
        return res
          .status(404)
          .json({
            success: false,
            message:
              "note was not able to be deleted as it was unable to be located",
          });
      }
    })
    //other error occurred
    .catch((err) => {
      logger.error("ERROR in delete note, cannot be deleted: " + err);
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
