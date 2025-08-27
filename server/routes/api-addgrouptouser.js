const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const usersFile = path.join(__dirname, '../data/users.json');
        const notificationFile = path.join(__dirname, '../data/notifications.json');

        // Function to read users from file
        const readUsers = () => {
            const data = fs.readFileSync(usersFile, 'utf8');
            const users = JSON.parse(data);
            return Array.isArray(users) ? users : [];
        };

        // Write users to file
        const writeUsers = (users) => {
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
        };

        // Function to read notifications from file
        const readNotifications = () => {
            const data = fs.readFileSync(notificationFile, 'utf8');
            const notifications = JSON.parse(data);
            return Array.isArray(notifications) ? notifications : [];
        };

        // Write notifications to file
        const writeNotifications = (notifications) => {
            fs.writeFileSync(notificationFile, JSON.stringify(notifications, null, 2), 'utf8');
        }

        app.put('/api/addgrouptouser', (req, res) => {
            if (!req.body || !req.body.groupId || !req.body.userId) {
                return res.status(400).json({ error: 'Invalid request data' });
            }

            // Find the user by ID
            let users = readUsers();
            const user = users.find(u => u.id === req.body.userId)
            if (user.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            // Double check if the user is already in the group
            if (user.groups.includes(req.body.groupId)) {
                return res.status(400).json({ error: "You're already in the group!" });
            }
            // Add the group to the user's groups
            user.groups.push(req.body.groupId);

            // Find the notification by ID
            let notifications = readNotifications();
            const approvedNotification = notifications.find(n => n.id === req.body.notificationId)
            if (approvedNotification.length === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            // Update status of the notification
            approvedNotification.status = 'approved';

            try {
                writeUsers(users);
                writeNotifications(notifications);
                res.sendStatus(204);
            }
            catch (error) {
                console.error('Error adding new group to user:', error);
                res.status(500).json({ error: 'Failed to add group to user' });
            }
        })
        
    }
}