const express = require("express")
const { getDetailUser, connection, editProfile } = require("./controller")
const { isLoginUser } = require("../middleware/auth")

const router = express.Router()

const multer = require("multer")
const upload = multer({ dest: '/public/uploads/profile' })

router.get("/:username", isLoginUser, getDetailUser)
router.patch("/connection/:friendId", isLoginUser, connection)
router.put("/edit", isLoginUser, upload.single("profilePath"), editProfile)

module.exports = router