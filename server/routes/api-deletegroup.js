const connectDB = require('../mongoDB');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const groupData = db.collection('groups');
        const channelData = db.collection('channels');
        const userData = db.collection('users');
        const membershipData = db.collection('membership');
        // Function to read groups from file
        const readGroups = () => {
            const data = fs.readFileSync(groupsFile, 'utf8');
            const groups = JSON.parse(data);
            return Array.isArray(groups) ? groups : [];
        };

        app.delete('/api/deletegroup/:id', async(req, res) => {
            const groupId = req.params.id;
            if (!groupId) {
                return res.status(400).json({ error: 'No group ID provided' });
            }

            // Remove the group with the specified ID, 
            // and also remove associated channels
            // and remove groups from related users and memberships
            try {
                await groupData.deleteOne({ _id: new ObjectId(groupId) });
                await channelData.deleteMany({ groupId: new ObjectId(groupId) });
                await userData.updateMany(
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