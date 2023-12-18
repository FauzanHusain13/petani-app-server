module.exports = {
    createActivity: async(req, res) => {
        try {
            const { description } = req.body

            
        } catch (err) {
           res.status(500).json({ message: err.message || "Internal server error" }) 
        }
    }
}