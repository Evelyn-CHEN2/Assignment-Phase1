const connectDB = require('../mongoDB');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const userData = db.collection('users');

        app.delete('/api/deleteuser/:userId', async(req, res) => {
            const userId = req.params.userId;
            const groupId = req.body.groupId;
            if (!userId || !groupId) {
                return res.status(400).json({ error: 'No user ID or group ID provided to delete' });
            }
            
            // Remove the user with the specified ID
            try {
                await userData.deleteOne({ _id: new ObjectId(userId) });
                res.sendStatus(204); // No response expected
            } 
            catch (error) {
                console.error('Error deleting user:', error);
                res.status(500).json({ error: 'Failed to delete user' });
            }
        });
    }
}