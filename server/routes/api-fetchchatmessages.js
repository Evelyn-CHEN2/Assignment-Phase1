const { ObjectId } = require('mongodb');

module.exports = {
    route: async(app, db) => {
        const chatMsgsData = db.collection('chatMsgs');

        app.get('/api/fetchchatmessages/:id', async(req, res) => {
            try {
                const channelId = String(req.params.id);
                const chatMsgs = await chatMsgsData
                    .find({channelId: new ObjectId(channelId)})
                    .sort({timestamp: 1})
                    .limit(50)
                    .toArray();
                res.send(chatMsgs);
            }
            catch (error) {
                console.error('Error reading users file: ', error);
                res.status(500).json({ error: 'Failed to retrieve users.' });
            }
        })
    }
}