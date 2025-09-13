const connectDB = require('../mongoDB');
const { ObjectId } = require('mongodb');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const groupsData = db.collection('groups');
        const channelsData = db.collection('channels');

        app.post('/api/createchannel', async(req, res) => {
            if (!req.body) {
                return res.status(400).json({ error: 'No data provided' });
            }
            const channelName = req.body.channelName;
            const groupId = String(req.body.groupId);
            // Check if the channel name exists
            let channels = await channelsData.find().toArray();
            const existingChannelName = channels.find(c => c.channelname.toLowerCase() === channelName.toLowerCase().trim());
            if (existingChannelName) {
                return res.status(400).json({ error: 'Channel name already exists' });
            }

            // Create new channel and update the related group
            try {
                const newData = {
                    channelname: channelName.trim(),
                    chatMsg: [],
                    groupId: new ObjectId(groupId)
                };
                const newChannelInsert = await channelsData.insertOne(newData);
                // Send formatted channel data back to fontend for UI update
                const newChannel = { ...newData, _id: newChannelInsert.insertedId };

                await groupsData.updateOne(
                    { _id: new ObjectId(groupId) },
                    { $push: { channels: newChannel.insertedId } }
                )
                console.log('New channel created:', newChannel);
                res.send(newChannel);
            } 
            catch (error) {
                console.error('Error creating a new channel:', error);
                res.status(500).json({ error: 'Failed to write a new channel' });
            }
        })
    }
}