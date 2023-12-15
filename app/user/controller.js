const User = require("./model")

module.exports = {
    getDetailUser: async(req, res) => {
        try {
            const { id } = req.params
            const user = await User.findOne({ _id: id })
    
            res.status(200).json({ data: user })
        } catch (error) {
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
    // editProfile: async(req, res) => {
    //     try {
            
    //     } catch (err) {
    //         res.status(500).json({ error: err.message || "Internal server error" })
    //     }
    // }
}