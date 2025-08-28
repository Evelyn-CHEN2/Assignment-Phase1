const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const notificationsFile = path.join(__dirname, '../data/notifications.json');

        // Function to read notifications from file
        const readNotifications = () => {
            const data = fs.readFileSync(notificationsFile, 'utf8');
            if (!data) return [];
            const notifications = JSON.parse(data);
            return Array.isArray(notifications) ? notifications : [];
        }

        app.get('/api/fetchnotifications', (req, res) => {
            const notifications = readNotifications();
            res.send(notifications);
        })
    }
}