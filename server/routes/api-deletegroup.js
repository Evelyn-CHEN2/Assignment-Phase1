const connectDB = require('../mongoDB');
const { ObjectId } = require('mongodb');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const groupsData = db.collection('groups');
        const channelsData = db.collection('channels');
        const usersData = db.collection('users');
        const membershipData = db.collection('membership');

        app.delete('/api/deletegroup/:id', async(req, res) => {
            const groupId = String(req.params.id);
            if (!groupId) {
                return res.status(400).json({ error: 'No group ID provided' });
            }

            // Remove the group with the specified ID, 
            // and also remove associated channels
            // and remove groups from related users and memberships
            try {
                await groupsData.deleteOne({ _id: new ObjectId(groupId) });
                await channelsData.deleteMany({ groupId: new ObjectId(groupId) });
                await usersData.updateMany(
                    { groups: new ObjectId(groupId) },
                    { $pull: { groups: new ObjectId(groupId) }}
                );
                await membershipData.updateMany(
                    { groups: new ObjectId(groupId) },
                    { $pull: { groups: new ObjectId(groupId) }}
                );
                res.sendStatus(204)
            } catch (error) {
                console.error('Error writing groups file:', error);
                res.status(500).json({ error: 'Failed to delete group' });
            }
        })
    }
}