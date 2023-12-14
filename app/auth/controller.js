const User = require("../user/model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { jwtkey } = require("../../config")

module.exports = {
    register: async(req, res) => {
        try {
            const { username, firstName, lastName, email, password, status } = req.body

            // cek duplikat email
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: `${email} sudah terdaftar!` });
            }

            const newUser = new User({
                username,
                name: firstName + lastName,
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