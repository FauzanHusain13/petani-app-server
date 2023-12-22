const express = require("express")
const { createActivity, deleteActivity } = require("./controller")
const { isLoginUser } = require("../middleware/auth")

const router = express.Router()

const multer = require("multer")
const upload = multer({ 
    dest: '/public/uploads/post'
})

router.post("/activity", isLoginUser, upload.single("picturePath"), createActivity)
router.delete("/activity/:activityId", isLoginUser, deleteActivity)

module.exports = router