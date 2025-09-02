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

        // Function to write users to file
        const writeUsers = (users) => {
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
        }

        app.put('/api/unbanuserbyID/:id', (req, res) => {
            if (!req.params) {
                return res.status(400).json({ error: 'No data provided' });
            }

            let users = readUsers();
            const userIndex = users.findIndex(u => u.id === Number(req.params.id));
            if (userIndex === -1) {
                return res.status(404).json({ error: 'User not found' });
            }
            users[userIndex].valid = true;

            try {
                writeUsers(users);
                res.sendStatus(204);
            }
            catch (error) {
                console.error('Error writing users file after banning: ', error);
                res.status(500).json({ error: 'Failed to ban user.' });
            }
        })
    }
}