const { group } = require('console');
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

        // Function to write users to file
        const writeUsers = (users) => {
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
        }

        // Function to read groups from file
        const readGroups = () => {
            const data = fs.readFileSync(groupsFile, 'utf8');
            const groups = JSON.parse(data);
            return Array.isArray(groups) ? groups : [];
        };

        // Function to write groups to file
        const writeGroups = (groups) => {
            fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2), 'utf8');
        }

        app.put('/api/updateuser/:userId', (req, res) => {
            const userId = req.params.userId;
            const groupId = req.body.groupId;
            const newRole = req.body.newRole;
            if (!userId || !groupId || !newRole) {
                return res.status(400).json({ error: 'Missing id or new role to update user role' });
            }
            
            // Check if the user's file exists
            const users = readUsers();
            const userIndex = users.findIndex(user => user.id === Number(userId));
            if (userIndex === -1) {
                return res.status(404).json({ error: 'User to update not found' });
            }
            // Update the user role
            users[userIndex].role = newRole;

            if (newRole === 'admin') {
                // Check if the group exists
                const groups = readGroups();
                const groupIndex = groups.findIndex(group => group.id === groupId);
                if (groupIndex === -1) {
                    return res.status(404).json({ error: 'Group to add admins not found' });
                }
                // If the user is already an admin, do nothing
                if (groups[groupIndex].admins.includes(Number(userId))) {
                    return
                }
                // Update the group admins
                groups[groupIndex].admins.push(Number(userId));
                writeGroups(groups);
            } else if (newRole === 'super') {
                users[userIndex].groups = [];
            }
            
            // Write the updated user to file
            try {
                writeUsers(users);
                res.sendStatus(204)
            } 
            catch (error) {
                console.error('Error writing updated user file:', error);
                res.status(500).json({ error: 'Failed to update user' });
            }
        })

    }
}