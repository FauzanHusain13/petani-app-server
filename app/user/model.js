const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const HASH_ROUND = 10

let connectionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

let userSchema = new mongoose.Schema({
    profilePath: {
        type: String
    },
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
    },
    location: {
        type: String
    },
    connections: [connectionSchema]
})

userSchema.pre("save", function(next) {
    if (!this.isModified("password")) {
        return next()
    }

    this.password = bcrypt.hashSync(this.password, HASH_ROUND);
    next();
});

module.exports = mongoose.model("User", userSchema)