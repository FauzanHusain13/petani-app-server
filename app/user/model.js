const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const HASH_ROUND = 10

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        min: 8
    },
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
    },
    password: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model("User", userSchema)