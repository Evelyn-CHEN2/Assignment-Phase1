const connectDB = require('../mongoDB');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const groupData = db.collection('groups');
        const channelData = db.collection('channels');

        app.post('/api/createchannel', async(req, res) => {
            if (!req.body) {
                return res.status(400).json({ error: 'No data provided' });
            }
            const { channelName, groupId } = req.body;
            // Check if the channel name exists
            let channels = await channelData.find().toArray();
            const existingChannelName = channels.find(c => c.channelname.toLowerCase() === channelName.toLowerCase().trim());
            if (existingChannelName) {
                return res.status(400).json({ error: 'Channel name already exists' });
            }

            // Create new channel and update the related group
            try {
                const newChannel = await channelData.insertOne({
                    _id: new ObjectId(),
                    channelName: channelName,
                    chatMsg: [],
                    groupId: new ObjectId(groupId)
                });
                await groupData.updateOne(
                    { _id: new ObjectId(groupId) },
                    { $push: { channels: newChannel.insertedId } }
                )
                res.send(newChannel);
            } 
            catch (error) {
                console.error('Error writing single channel file:', error);
                res.status(500).json({ error: 'Failed to write single channel' });
            }
        })
    }
}