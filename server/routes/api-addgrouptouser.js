const connectDB = require('../mongoDB');

module.exports = {
    route: async(app) => {
        const db = await connectDB();
        const usersData = db.collection('users');
        const notificationsData = db.collection('notifications');
        
        app.put('/api/addgrouptouser', async(req, res) => {
            if (!req.body) {
                return res.status(400).json({ error: 'Invalid request data' });
            }
            const { applierId, groupId, notificationId, approvedBy } = req.body;
            // Find the user by ID
            let users = await usersData.find().toArray();
            const user = users.find(u => u._id === applierId)
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            // Double check if the user is already in the group
            if (user.groups.includes(groupId)) {
                return res.status(400).json({ error: "You're already in the group!" });
            }

            // Find the notification by ID
            let notifications = await notificationsData.find().toArray();
            const approvedNotification = notifications.find(n => n._id === notificationId)
            if (!approvedNotification) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            // Update group to user and notification
            try {
                await users.findOneAndUpdate(
                    { _id: new ObjectId(applierId) }, 
                    { $push: { groups: groupId}}
                );
                await notifications.findOneAndUpdate(
                    { _id: new ObjectId(notificationId) },
                    { $set: { status: 'approved', approvedBy: new ObjectId(approvedBy) } }
                )
                res.sendStatus(204);
            }
            catch (error) {
                console.error('Error adding new group to user:', error);
                res.status(500).json({ error: 'Failed to add group to user' });
            }
        })  
    }
}