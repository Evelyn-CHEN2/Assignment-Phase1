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
        };

        app.delete('api/removeuserfromgroup', (req, res) => {
            const userId = req.params.userId;
            const groupId = req.body.groupId;
            if (!userId || !groupId) {
                return res.status(400).json({ error: 'No user ID or group ID provided to delete' });
            }
            
            let users = readUsers();
            users = users.map(u => {
                if (u.id === userId) {
                    u.groups = u.groups.filter(g => g.id !== groupId);
                    return u;
                }
            })

            try {
                writeUsers(users);
                res.sendStatus(204); // No response expected
            } 
            catch (error) {
                console.error('Error deleting user:', error);
                res.status(500).json({ error: 'Failed to delete user' });
            }
        });
    }
}