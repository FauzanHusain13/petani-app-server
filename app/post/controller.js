const fs = require("fs")
const path = require("path")
const { rootPath } = require("../../config")

const Post = require("./model")
const User = require("../user/model")

module.exports = {
    createActivity: async(req, res) => {
        try {
            const { description } = req.body

            if(req.file) {
                let tmp_path = req.file.path;
                let originalExt = req.file.originalname.split(".")[req.file.originalname.split(".").length - 1];
                let filename = req.file.filename + "." + originalExt;
                let target_path = path.resolve(rootPath, `public/uploads/post/${filename}`);

                const src = fs.createReadStream(tmp_path);
                const dest = fs.createWriteStream(target_path);

                src.pipe(dest);

                src.on("end", async() => {
                    try {
                        const post = new Post({ 
                            user: req.user.id,
                            description, 
                            picturePath: filename,
                            likes: {},
                            comments: []
                        })

                        await post.save();

                        res.status(201).json({
                            data: post
                        })
                    } catch (err) {
                        if(err && err.name === "ValidationError") {
                            return res.status(422).json({
                                error: 1,
                                message: err.message,
                                fields: err.errors
                            })
                        }
                    }
                })
            } else {
                const post = new Post({
                    user: req.user.id,
                    description: description,
                    likes: {},
                    comments: []
                })

                await post.save()

                res.status(201).json({
                    data: post
                })
            }
        } catch (err) {
           res.status(500).json({ message: err.message || "Internal server error" }) 
        }
    },
    deleteActivity: async(req, res) => {
        try {
            const { activityId } = req.params

            const post = await Post.findOne({
                _id: activityId,
                user: req.user.id
            })

            if (!post) {
                return res.status(404).json({ message: "Aktivitas tidak ditemukan" });
            }

            await Post.findOneAndDelete({
                _id: activityId,
                user: req.user.id
            })

            let currentImage = `${rootPath}/public/uploads/post/${post.picturePath}`;
            
            if(fs.existsSync(currentImage)){
                fs.unlinkSync(currentImage)
            }

            res.status(201).json({
                data: "Berhasil hapus postingan"
            })
        } catch (err) {
            res.status(500).json({ message: err.message || "Internal server error" }) 
        }
    },
    getPersonalActivity: async(req, res) => {
        try {
            const { userId } = req.params

            const post = await Post.find({ user: userId }).populate("user")
            if (!post) {
                return res.status(404).json({ message: "Aktivitas tidak ditemukan!" })
            }

            res.status(200).json({ data: post })
        } catch (err) {
            res.status(500).json({ message: err.message || "Internal server error" }) 
        }
    },
    getFeedActivity: async(req, res) => {
        try {
            const { userId } = req.params;

            const user = await User.findOne({ _id: userId });
            const connections = user.connections.map(connection => connection.user);
    
            const posts = await Post.find({ user: { $in: connections } }).populate("user");
    
            res.status(200).json({ data: posts });
        } catch (err) {
            res.status(500).json({ message: err.message || "Internal server error" }) 
        }
    },
    likeActivity: async(req, res) => {
        try {
            const { postId } = req.params

            const post = await Post.findOne({ _id: postId })
            const user = await User.findOne({ _id: post.user })
            const isLiked = post.likes.get(req.user.id)

            if (!post) {
                return res.status(404).json({ message: "Aktivitas tidak ditemukan!" })
            }
    
            if(isLiked) {
                post.likes.delete(req.user.id)
            } else {
                post.likes.set(req.user.id, true)

                // validasi: jika didalam array notifications sudah ada req.user.username
                const checkNotification = user.notifications.some(notif => notif.username.toString() === req.user.username);

                // kirim notifikasi
                if(!checkNotification) {
                    user.notifications.push({
                        userId: req.user.id,
                        username: req.user.username,
                        name: req.user.name,
                        profilePath: req.user.profilePath,
                        message: `${req.user.username} menyukai aktivitas anda`
                    })
                    await user.save()
                }
            }
    
            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { 
                    likes: post.likes 
                },
                { new: true }
            )
    
            res.status(200).json({ data: updatedPost })  
        } catch (err) {
            res.status(500).json({ message: err.message || "Internal server error" })
        }
    },
    commentActivity: async(req, res) => {
        try {
            const { postId } = req.params
            const { comment } = req.body
        
            const post = await Post.findOne({ _id: postId })
            if (!post) {
              return res.status(404).json({ message: "Aktivitas tidak ditemukan!" })
            }
        
            post.comments.push({
                userId: req.user.id,
                username: req.user.username,
                name: req.user.name,
                profilePath: req.user.profilePath,
                comment: comment
            })
        
            const updatedPost = await post.save()
        
            res.status(200).json({ data: updatedPost })
        } catch (err) {
            res.status(500).json({ message: err.message || "Internal server error" })
        }
    },
    deleteCommentActivity: async(req, res) => {
        try {
            const { postId, commentId } = req.params

            const post = await Post.findOne({ _id: postId })
            if (!post) {
                return res.status(404).json({ message: "Aktivitas tidak ditemukan!" });
            }
            
            const commentIndex = post.comments.findIndex(
                (comment) => comment._id.toString() === commentId
            );
              
            if (commentIndex === -1) {
                return res.status(404).json({ message: "Komentar tidak ditemukan!" });
            }
            if (req.user.id.toString() !== post.comments[commentIndex].userId.toString()) {
                return res.status(400).json({ message: "Kamu tidak berwenang menghapus komentar ini" });
            }
              
            post.comments.splice(commentIndex, 1); // Menghapus komentar dari array
            const updatedPost = await post.save();
              
            res.status(200).json({ data: updatedPost });
        } catch (err) {
            res.status(500).json({ message: err.message || "Internal server error" })
        }
    }
}