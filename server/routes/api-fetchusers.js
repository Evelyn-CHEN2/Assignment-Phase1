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

        app.get('/api/fetchusers', (req, res) => {
            try {
                const users = readUsers();
                res.send(users);
            } 
            catch (error) {
                console.error('Error reading users file: ', error);
                res.status(500).json({ error: 'Failed to retrieve users.' });
            }
        });
    }
}