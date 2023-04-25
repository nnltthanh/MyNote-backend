const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    //login credentials: email and password
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    token: String

});




exports.User = mongoose.model('User', userSchema, 'user');