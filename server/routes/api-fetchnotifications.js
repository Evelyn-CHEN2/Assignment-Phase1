const connectDB = require('../mongoDB');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const notificationsData = db.collection('notifications');

        app.get('/api/fetchnotifications', async(req, res) => {
            const notifications = await notificationsData.find().toArray();
            res.send(notifications);
        })
    }
}