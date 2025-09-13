const connectDB = require('../mongoDB');
const { ObjectId } = require('mongodb');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const usersData = db.collection('users');

        app.delete('/api/removeuserfromgroup', async(req, res) => {
            if (!req.query.userId || !req.query.groupId) {
                return res.status(400).json({ error: 'No data provided' });
            };
            const userId = String(req.query.userId);
            const groupId = String(req.query.groupId);
            // Delete groupId from user's groups array
            try {
                await usersData.updateOne(
                    { _id: new ObjectId(userId) },
                    { $pull: { groups: new ObjectId(groupId) } }
                );
                res.sendStatus(204);
            }
            catch (error) {
                console.error('Error removing user from group: ', error);
                res.status(500).json({ error: 'Failed to remove user from group.' });
            }
        })
    }
}