const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const Notification = require('../models/notification-class');
        const notificationsFile = path.join(__dirname, '../data/notifications.json'); 

        // Function to read notifications from file
        const readNotifications = () => {
            const data = fs.readFileSync(notificationsFile, 'utf8');
            if (!data) return [];
            const notifications = JSON.parse(data);
            return Array.isArray(notifications) ? notifications : [];
        };

        // Function to write notifications to file
        const writeNotifications = (notifications) => {
            fs.writeFileSync(notificationsFile, JSON.stringify(notifications, null, 2));
        };

        app.post('/api/createnotification', (req, res) => {
            if (!req.body) {
                return res.status(400).json({ error: 'No data provided' });
            }

            let notifications = readNotifications();
            // Create a new notification object
            const newNotification = new Notification(
                new Date().toISOString(),
                req.body.userId,
                req.body.groupId,
                req.body.groupCreatorId,
                'pending'  // initial status is pending
            )

            notifications.push(newNotification);
            try {
                writeNotifications(notifications);
                res.send(newNotification);
            }
            catch (error) {
                console.error('Error creating notifications:', error);
                res.status(500).json({ error: 'Failed to save notification' });
            }
        })

        
    }
}