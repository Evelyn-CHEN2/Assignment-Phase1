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

        app.put('/api/updateuser/:id', (req, res) => {
            const id = req.params.id;
            const newRole = req.body.newRole;
            if (!id || !newRole) {
                return res.status(400).json({ error: 'Missing id or new role to update user role' });
            }
            // Check if the users file exists
            const users = readUsers();
            const userIndex = users.findIndex(user => user.id === Number(id));
            if (userIndex === -1) {
                return res.status(404).json({ error: 'User to update not found' });
            }
            // Update the user
            users[userIndex].role = newRole;
            
            // Write the updated user to file
            try {
                writeUsers(users);
                res.send(users[userIndex]); // Return the updated user
            } 
            catch (error) {
                console.error('Error writing updated user file:', error);
                res.status(500).json({ error: 'Failed to update user' });
            }
        })

    }
}