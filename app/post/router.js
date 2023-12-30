const express = require("express")
const { createActivity, deleteActivity, getPersonalActivity, getFeedActivity, likeActivity, commentActivity, deleteCommentActivity, bookmarkActivity } = require("./controller")
const { isLoginUser } = require("../middleware/auth")

const router = express.Router()

const multer = require("multer")
const upload = multer({ 
    dest: '/public/uploads/post'
})

router.post("/activity", isLoginUser, upload.single("picturePath"), createActivity)
router.delete("/activity/:activityId", isLoginUser, deleteActivity)
router.get("/activity/:userId", isLoginUser, getPersonalActivity)
router.get("/activity/feed/:userId", isLoginUser, getFeedActivity)
router.patch("/activity/like/:postId", isLoginUser, likeActivity)
router.post("/activity/comment/:postId", isLoginUser, commentActivity)
router.delete("/activity/comment/:postId/:commentId", isLoginUser, deleteCommentActivity)
router.patch("/activity/bookmarks/:postId", isLoginUser, bookmarkActivity)

module.exports = router