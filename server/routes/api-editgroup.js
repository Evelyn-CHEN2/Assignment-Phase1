const connectDB = require('../mongoDB');

module.exports = {
    route: async(app) =>  {
        const db = await connectDB();
        const groupData = db.collection('groups');

        app.put('/api/editgroup/:groupId', async(req, res) => {
            if (!req.body || !req.params)  {
                return res.status(400).json({ error: 'Invalid request body or parameters.' });
            }
            const groupId = req.params.groupId;
            const newGroupName = req.body.newGroupName; 
            // Check if new group name exists
            const existingGroup = await groupData.findOne({ groupname: newGroupName });
            if (existingGroup) {
                return res.status(400).json({ error: 'Group name already exists.' });
            }
            // Update the group with the specified ID
            try {
                await groupData.findOneAndUpdate(
                    { _id: new ObjectId(groupId) },
                    { $set: { groupname: newGroupName } }
                );
                res.sendStatus(204);
            }
            catch (error) {
                console.error('Error editing groups file: ', error);
                res.status(500).json({ error: 'Failed to edit group.' });
            }
        })
    }
}