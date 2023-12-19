const fs = require("fs")
const path = require("path")
const { rootPath } = require("../../config")

const Post = require("./model")

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
    }
}