const express = require("express")
const { getDetailUser, connection } = require("./controller")
const { isLoginUser } = require("../middleware/auth")

const router = express.Router()

router.get("/:id", isLoginUser, getDetailUser)
router.patch("/connection/:friendId", isLoginUser, connection)

module.exports = router