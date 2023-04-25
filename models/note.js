//this is the model for a journal entry and what it would contain upon its creation
//by a user
const mongoose = require('mongoose');
const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    title: String,
    entryBody: String,
    entryDate: String,
    mood: String

});



exports.Note = mongoose.model('Node', noteSchema, 'note');