const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const usersFile = path.join(__dirname, '../data/users.json');
        const groupsFile = path.join(__dirname, '../data/groups.json');

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

        app.post('/api/addgrouptouser', (req, res) => {
            if (!req.body || !req.body.groupId || !req.body.userId) {
                return res.status(400).json({ error: 'Invalid request data' });
            }

            // Find the user by ID
            let users = readUsers();
            const user = users.filter(u => u.id === req.body.userId)
            if (user.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Add the group to the user's groups
            user.groups.push(req.body.groupId);
            try {
                writeUsers(users);
                res.sendStatus(200);
            }
            catch (error) {
                console.error('Error adding new group to user:', error);
                res.status(500).json({ error: 'Failed to add group to user' });
            }
        })
        
    }
}