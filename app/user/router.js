const express = require("express")
const { getDetailUser, connection, editProfile, editDescription, searchUser, deleteNotifications } = require("./controller")
const { isLoginUser } = require("../middleware/auth")

const router = express.Router()

const multer = require("multer")
const upload = multer({ 
    dest: '/public/uploads/profile'
})

router.get("/:username", isLoginUser, getDetailUser)
router.patch("/connection/:friendId", isLoginUser, connection)
router.put("/profile", isLoginUser, upload.single("profilePath"), editProfile)
router.put("/about", isLoginUser, editDescription)
router.post("/search", isLoginUser, searchUser)
router.delete("/notifications", isLoginUser, deleteNotifications)

module.exports = router