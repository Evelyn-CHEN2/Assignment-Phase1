const { ObjectId } = require('mongodb')

module.exports = {
    route: async(app, db) => {
        const banReportsData = db.collection('banReports')
        
        app.put('/api/unbanuserbyID/:id', async(req, res) => {
            if (!req.params || !req.body) {
                return res.status(400).json({ error: 'No data provided' });
            }
            const userId = String(req.params.id);
            const channelId = String(req.body.channelId);

            try {
                await banReportsData.updateOne(
                    { userId: new ObjectId(userId) },
                    { $pull: { channelIds: new ObjectId(channelId)}}
                );
                res.sendStatus(204);
            }
            catch (error) {
                console.error('Error writing ban reports file after unbanning: ', error);
                res.status(500).json({ error: 'Failed to unban user.' });
            }
        })
    }
}