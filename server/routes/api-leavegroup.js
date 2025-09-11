const connectDB = require('../mongoDB');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const userData = db.collection('users');

        app.delete('/api/leavegroup', async(req, res) => {
            if (!req.query|| !req.query.groupId || !req.query.userId) {
                return res.status(400).json({ error: 'Invalid request data' });
            }
            const { groupId, userId } = req.query;
            // Find the user by ID
            let users = await userData.find().toArray();
            const user = users.find(u => u.id === Number(req.query.userId));
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            try {
                await userData.findOneAndUpdate(
                    { _id: new ObjectId(userId) },
                    { $pull: { groups: groupId } }
                );
                res.sendStatus(204);
            } catch (error) {
                console.error('Error deleting group from user:', error);
                res.status(500).json({ error: 'Failed to delete group from user' });
            }
        })
    }
}