const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const usersFile = path.join(__dirname, '../data/users.json');

        // Function to read users from file
        const readUsers = () => {
            const data = fs.readFileSync(usersFile, 'utf8');
            const users = JSON.parse(data);
            return Array.isArray(users) ? users : [];
        };

        // Write users to file
        const writeUsers = (users) => {
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
        }

        app.delete('/api/deletegroupfromuser', (req, res) => {
            if (!req.query|| !req.query.groupId || !req.query.userId) {
                return res.status(400).json({ error: 'Invalid request data' });
            }
            // Find the user by ID
            let users = readUsers();
            const user = users.find(u => u.id === Number(req.query.userId));
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Remove the group from the user's groups
            user.groups = user.groups.filter(g => g !== req.query.groupId);
            console.log('Updated user groups:', user.groups);
            try {
                writeUsers(users);
                res.sendStatus(204);
            } catch (error) {
                console.error('Error deleting group from user:', error);
                res.status(500).json({ error: 'Failed to delete group from user' });
            }
        })
    }
}