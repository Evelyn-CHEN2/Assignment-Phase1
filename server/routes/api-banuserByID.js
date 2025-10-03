const { ObjectId } = require('mongodb');

module.exports = {
    route: async(app, db) => {
        const banReportsData = db.collection('banReports')

        app.post('/api/banuserbyID/:id', async(req, res) => {
            if (!req.params || !req.body) {
                return res.status(400).json({ error: 'No data provided' });
            }
            const userId = String(req.params.id);
            const channelId = String(req.body.channelId);

            // Create a new banReport collection
            try {
                const newBanReport = await banReportsData.updateOne(
                    { userId: new ObjectId(userId) },
                    {
                        $addToSet: { channelIds: new ObjectId(channelId) }
                    },
                    { upsert: true }
            );
                res.send(newBanReport);
            }
            catch (error) {
                console.error('Error writing ban report after banning: ', error);
                res.status(500).json({ error: 'Failed to ban user.' });
            }
        })
    }
}