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

        app.delete('/api/deleteuser/:id', (req, res) => {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: 'No user ID provided to delete' });
            }
            
            let users = readUsers();
            users = users.filter(user => user.id !== Number(id));

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