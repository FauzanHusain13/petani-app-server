const express = require("express")
const { connection } = require("./controller")

const router = express.Router()

router.patch("/connection/:friendId", connection)

module.exports = router