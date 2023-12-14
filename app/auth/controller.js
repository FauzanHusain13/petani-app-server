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
                status,
                location: ""
            })
            const savedUser = await newUser.save()
            res.status(201).json({ data: savedUser })
        } catch (err) {
            res.status(500).json({ error: err.message || "Internal server error" })
        }
    },
    login: async(req, res) => {
        const { username, password } = req.body

        User.findOne({ username }).then((user) => {
            if(user) {
                const checkPassword = bcrypt.compareSync(password, user.password)

                if(checkPassword) {
                    const token = jwt.sign({
                        user: {
                            id: user.id,
                            username: user.username,
                            name: user.name,
                            email: user.email,
                            status: user.status,
                            location: user.location
                        }
                    }, jwtkey)

                    res.status(200).json({ data: { token } })
                } else {
                    res.status(403).json({
                        message: "Data belum terdaftar!"
                    })  
                }
            } else {
                res.status(403).json({
                    message: `Data belum terdaftar!`
                })
            }
        }).catch((err) => {
            res.status(500).json({
                message: err.message || `Internal server error`
            })
        })
    }
}