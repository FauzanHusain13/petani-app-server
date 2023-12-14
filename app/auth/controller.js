const User = require("../user/model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { jwtkey } = require("../../config")

module.exports = {
    register: async(req, res) => {
        try {
            const { username, firstName, lastName, email, password, status } = req.body

            // cek duplikat email
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: `email ${email} sudah terdaftar!` });
            }

            // cek duplikat username
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: `username ${username} sudah terdaftar!` });
            }    

            const newUser = new User({
                username,
                name: `${firstName} ${lastName}`,
                email, 
                password,
                status
            })
            const savedUser = await newUser.save()
            res.status(201).json({ data: savedUser })
        } catch (err) {
            res.status(500).json({ error: err.message || "Internal server error" })
        }
    }
}