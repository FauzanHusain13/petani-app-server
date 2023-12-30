const fs = require("fs")
const path = require("path")
const { rootPath } = require("../../config")

const User = require("./model")

module.exports = {
    getDetailUser: async(req, res) => {
        try {
            const { username } = req.params
            const user = await User.findOne({ username: username }).select("_id username name email password status location connections profilePath")
    
            res.status(200).json({ data: user })
        } catch (error) {
            res.status(500).json({ error: err.message || "Internal server error" })
        }
    },
    getBookmarks: async(req, res) => {
        try {
            const { userId } = req.params
            const user = await User.findOne({ _id: userId }).populate({
                path: 'bookmarks.post',
                populate: {
                    path: 'user',
                    model: 'User'
                }
            }).select("bookmarks")

            if(userId === req.user.id) {
                const bookmarks = user.bookmarks
                res.status(200).json({ data: bookmarks })
            } else {
                return res.status(404).json({ message: "Anda tidak memiliki akses!" })
            }
        } catch (err) {
            res.status(500).json({ error: err.message || "Internal server error" })
        }
    },
    connection: async(req, res) => {
        try {
            const { friendId } = req.params

            const user = await User.findOne({ _id: req.user._id })
            const friend = await User.findOne({ _id: friendId })

            const isConnected = user.connections.some(connection => connection.user.toString() === friendId);

            if(isConnected) {
                user.connections = user.connections.filter(connection => connection.user.toString() !== friendId);
                friend.connections = friend.connections.filter(connection => connection.user.toString() !== req.user.id);

                await user.save();
                await friend.save();

                res.status(200).json({ data: `Berhasil hapus koneksi!` })
            } else {
                user.connections.push({
                    user: friendId
                })
                friend.connections.push({
                    user: req.user._id
                })
                await user.save()
                await friend.save()

                res.status(200).json({ data: `Berhasil tambahkan koneksi!` })
            }
        } catch (err) {
            res.status(500).json({ error: err.message || "Internal server error" })
        }
    },
    editProfile: async(req, res, next) => {
        try {
            const { username = "", name = "", status = "" } = req.body
            const payload = {}

            if(username.length) payload.username = username
            if(name.length) payload.name = name
            if(status.length) payload.status = status

            if(req.file) {
                let tmp_path = req.file.path;
                let originalExt = req.file.originalname.split(".")[req.file.originalname.split(".").length - 1];
                let filename = req.file.filename + "." + originalExt;
                let target_path = path.resolve(rootPath, `public/uploads/profile/${filename}`);

                const src = fs.createReadStream(tmp_path);
                const dest = fs.createWriteStream(target_path);

                src.pipe(dest);

                src.on("end", async() => {
                    const user = await User.findOne({ _id: req.user.id });
                    const currentImage = `${rootPath}/public/uploads/profile/${user.profilePath}`;    
                    if(fs.existsSync(currentImage)){
                        fs.unlinkSync(currentImage)
                    }

                    user = await User.findOneAndUpdate({
                        _id: req.user._id
                    },{
                        ...payload,
                        profilePath: filename
                    }, { new: true, runValidators: true })

                    res.status(201).json({
                        data: {
                            id: user.id,
                            username: user.username,
                            name: user.name,
                            status: user.status,
                            profilePath: user.profilePath
                        }
                    })
                })

                src.on("err", async() => {
                    next(err)
                })
            } else {
                const user = await User.findOneAndUpdate({
                    _id: req.user._id
                }, payload, { new: true, runValidators: true })

                res.status(201).json({
                    data: {
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        status: user.status,
                        profilePath: user.profilePath
                    }
                })
            }
        } catch (err) {
            res.status(500).json({ message: err.message || "Internal server error" })
        }
    },
    editDescription: async(req, res) => {
        try {
            const { description = "" } = req.body
            const payload = {}

            if(description.length) payload.description = description

            let user = await User.findOneAndUpdate({
                _id: req.user.id
            }, payload, { new: true, runValidators: true })

            res.status(201).json({
                data: {
                    id: user.id,
                    username: user.username,
                    description: user.description,
                }
            })
        } catch (err) {
            res.status(500).json({ message: err.message || "Internal server error" })
        }
    },
    searchUser: async(req, res) => {
        try {
            const { username } = req.body

            const users = await User.find()
            const searchResults = users.filter(user => user.username.toLowerCase().includes(username.toLowerCase()));

            res.status(200).json({ data: searchResults });
        } catch (err) {
            res.status(500).json({ message: err.message || "Internal server error" })
        }
    },
    deleteNotifications: async(req, res) => {
        try {
            const user = await User.findOne({ _id: req.user.id });

            if (!user) {
                return res.status(404).json({ message: "Pengguna tidak ditemukan!" });
            }

            user.notifications = [];
            await user.save();
        
            res.status(200).json({ message: "Notifications cleared successfully" });
        } catch (err) {
            res.status(500).json({ message: err.message || "Internal server error" })
        }
    }
}