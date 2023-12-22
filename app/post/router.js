const express = require("express")
const { createActivity, deleteActivity, getPersonalActivity } = require("./controller")
const { isLoginUser } = require("../middleware/auth")

const router = express.Router()

const multer = require("multer")
const upload = multer({ 
    dest: '/public/uploads/post'
})

router.post("/activity", isLoginUser, upload.single("picturePath"), createActivity)
router.delete("/activity/:activityId", isLoginUser, deleteActivity)
router.get("/activity/:userId", isLoginUser, getPersonalActivity)

module.exports = router