const User = require("./model")

module.exports = {
    connection: async(req, res) => {
        try {
            const { friendId } = req.params

            const user = await User.findOne({ _id: req.user._id })
            const friend = await User.findOne({ _id: friendId })

            if(friend.connections.includes(req.user._id)) {
                user.connections = user.connections.filter((id) => id.toString() !== friendId.toString())
                friend.connections = friend.connections.filter((id) => id.toString() !== req.user._id.toString())
            } else {
                user.connections.push({
                    user: friendId
                }).save()
                friend.connections.push({
                    user: req.user._id
                }).save()
            }

            res.status(200).json({ data: `Berhasil tambahkan teman!` })
        } catch (err) {
            res.status(500).json({ error: err.message || "Internal server error" })
        }
    }
}