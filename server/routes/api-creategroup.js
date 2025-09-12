const connectDB = require('../mongoDB');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const groupData = db.collection('groups');
        const channelData = db.collection('channels');
        const userData = db.collection('users');
        const membershipData = db.collection('membership');

        app.post('/api/creategroup', async(req, res) => {
                if (!req.body || !req.body.groupname || !req.body.description || !req.body.channelNames || !req.body.userId) {
                    return res.status(400).json({ error: 'Invalid request data' });
                }
                const { groupname, description, userId } = req.body;

                let groups = await groupData.find().toArray();
                // Check if group name already exists
                const existingGroupName = groups.find(g => g.groupname.toLowerCase() === groupname.trim().toLowerCase());
                if (existingGroupName) {
                    return res.status(400).json({ error: 'Group already exists' });
                }

                // Create new channel objects
                const channelnames = req.body.channelNames;
                const newchannels = channelnames.map(channelname => {
                    return {
                        _id: new ObjectId(),
                        channelname: channelname.trim(),
                        chatMsg: [],
                        groupId: null 
                    }
                })
                await channelData.insertMany(newchannels);

                try {
                    const newgroup = await groupData.insertOne({
                        _id: new ObjectId(),
                        groupname: groupname.trim(),
                        description: description.trim(),
                        channels: newchannels.map(c => c._id),
                        createdBy: new ObjectId(currentUser._id)
                    });
                    // Add new groupId to channels
                    await channelData.updateMany(
                        { _id: { $in: newchannels.map(c => c._id) }},
                        {$set: { groupId: newgroup.insertedId } }
                    );
                    // Add new groupId to user's groups
                    await userData.updateOne(
                        { _id: new ObjectId(userId) },
                        { $push: { groups: newgroup.insertedId } }
                    );
                    // Update membership collection
                    await membershipData.find({ admin: new ObjectId(userId) });
                    if (membership) {
                        await membershipData.updateOne(
                            { admin: new ObjectId(userId) },
                            { $push: { groups: newgroup.insertedId } }
                        );
                    } else {
                        await membershipData.insertOne({
                            _id: new ObjectId(),
                            role: 'admin',
                            admin: new ObjectId(userId),
                            groups: [newgroup.insertedId]
                        });
                    }
                    res.send(newgroup);
                }
                catch (error) {
                    console.error('Error creating new group:', error);
                    res.status(500).json({ error: 'Failed to create group' });
                }
                
            
           
        })
    }
}