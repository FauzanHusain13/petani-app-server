const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const HASH_ROUND = 10

let connectionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

let notificationSchema = mongoose.Schema({
    userId: {
        type: String,
    },
    username: {
        type: String,
    },
    name: {
        type: String,
    },
    profilePath: {
        type: String,
    },
    message: {
        type: String
    }
})

let bookmarkSchema = mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
})

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
    },
    location: {
        type: String
    },
    connections: [connectionSchema],
    profilePath: {
        type: String
    },
    description: {
        type: String
    },
    notifications: [notificationSchema],
    bookmarks: [bookmarkSchema]
})

userSchema.pre("save", function(next) {
    if (!this.isModified("password")) {
        return next()
    }

    this.password = bcrypt.hashSync(this.password, HASH_ROUND);
    next();
});

module.exports = mongoose.model("User", userSchema)