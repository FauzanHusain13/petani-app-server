const express = require("express")
const { connection } = require("./controller")
const { isLoginUser } = require("../middleware/auth")

const router = express.Router()

router.patch("/connection/:friendId", isLoginUser, connection)

module.exports = router