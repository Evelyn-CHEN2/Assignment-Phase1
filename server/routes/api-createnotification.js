const connectDB = require('../mongoDB');
const { ObjectId } = require('mongodb');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const notificationData = db.collection('notifications');

        app.post('/api/createnotification', async(req, res) => {
            if (!req.body) {
                return res.status(400).json({ error: 'No data provided' });
            }
            const userId = String(req.body.userId);
            const groupId = String(req.body.groupId);
            
            // Create a new notification collection
            try {
                await notificationData.insertOne({
                    _id: new ObjectId(),
                    applier: new ObjectId(userId),
                    groupToApply: new ObjectId(groupId),
                    status: 'pending',
                    approvedBy: null,
                    timestamp: new Date()   
                });
                res.sendStatus(204);
            }
            catch (error) {
                console.error('Error creating notifications:', error);
                res.status(500).json({ error: 'Failed to save notification' });
            }
        })  
    }
}