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

        app.get('/api/fetchuserbyID/:id', (req, res) => {
            if (!req.params.id) {
                return res.status(400).json({ error: 'No user ID provided' });
            }

            try {
                const users = readUsers();
                const user = users.find(u => u.id === Number(req.params.id)); // req.params.id is a string

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.send(user);
            } catch (error) {
                console.error('Error reading users file: ', error);
                res.status(500).json({ error: 'Failed to retrieve user.' });
            }
        });
    }
}