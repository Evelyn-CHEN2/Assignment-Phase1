const { ObjectId } = require('mongodb');

module.exports = {
    route: async(app, db) => {
        const groupsData = db.collection('groups');
        const channelsData = db.collection('channels');

        app.delete('/api/deletechannel/:id', async(req,res) => {
            const channelId = String(req.params.id);
            if (!channelId) {
                return res.status(400).json({ error: 'No channel ID provided to delete' });
            }

            // Update channels and groups data
            try {
                await channelsData.deleteOne({ _id: new ObjectId(channelId) });
                await groupsData.updateOne(
                    { channels: new ObjectId(channelId) },
                    { $pull: { channels: new ObjectId(channelId) } }
                )
                res.sendStatus(204); // No response expected
            }
            catch (error) {
                console.error('Error deleting channel:', error);
                res.status(500).json({ error: 'Failed to delete channel' });
            }
        })
    }
}