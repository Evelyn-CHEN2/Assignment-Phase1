module.exports = {
    route: async(app, db) => {
        const notificationsData = db.collection('notifications');

        app.get('/api/fetchnotifications', async(req, res) => {
            const notifications = await notificationsData.find().toArray();
            res.send(notifications);
        })
    }
}