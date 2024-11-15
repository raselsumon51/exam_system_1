const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    password: Number,
    role: String
})


module.exports = mongoose.model("User", userSchema);