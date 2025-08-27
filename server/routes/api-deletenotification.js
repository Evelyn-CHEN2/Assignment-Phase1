const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const notificationFile = path.join(__dirname, '../data/notifications.json');

        // Function to read notifications from file
        const readNotifications = () => {
            const data = fs.readFileSync(notificationFile, 'utf8');
            const notifications = JSON.parse(data);
            return Array.isArray(notifications) ? notifications : [];
        }

        // Write notifications to file
        const writeNotifications = (notifications) => {
            fs.writeFileSync(notificationFile, JSON.stringify(notifications, null, 2), 'utf8');
        }

        app.delete('/api/deletenotification/:id', (req, res) => {
            if (!req.params) {
                return res.status(400).json({ error: 'Invalid request data' });
            }

            // Find the notification by ID
            let notifications = readNotifications();
            const notificationIndex = notifications.findIndex(n => n.id === req.params.id);
            if (notificationIndex === -1) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            // Remove the notification from the array
            notifications.splice(notificationIndex, 1);

            try {
                writeNotifications(notifications);
                res.sendStatus(204);  // If return 200, the UI didn't get updated immediately!!
            } catch (error) {
                return res.status(500).json({ error: 'Failed to delete notification' });
            }
        })
    }
}