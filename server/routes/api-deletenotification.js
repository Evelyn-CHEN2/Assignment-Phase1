const connectDB = require('../mongoDB');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const notificationsData = db.collection('notifications');

        app.delete('/api/deletenotification/:id', async(req, res) => {
            if (!req.params) {
                return res.status(400).json({ error: 'Invalid request data' });
            }
            const id = req.params.id;

            // Delete the notification with the specified ID
            try {
                await notificationsData.deleteOne({ _id: new ObjectId(id) });
                res.sendStatus(204);
            } catch (error) {
                return res.status(500).json({ error: 'Failed to delete notification' });
            }
        })
    }
}