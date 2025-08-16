const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) => {
        const groupsFile = path.join(__dirname, '../data/groups.json');

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

        app.delete('/api/deletegroup/:id', (req, res) => {
            if (!req.params.id) {
                return res.status(400).json({ error: 'No group ID provided' });
            }

            let groups = readGroups();
            
            // Check if the group exists
            const groupIndex = groups.findIndex(group => group.id === req.params.id);
            if (groupIndex === -1) {
                return res.status(404).json({ error: 'Group not found' });
            }

            // Remove the group from the array
            groups.splice(groupIndex, 1);
            try {
                writeGroups(groups);
                console.log('Group deleted successfully');
            } catch (error) {
                console.error('Error writing groups file:', error);
                res.status(500).json({ error: 'Failed to delete group' });
            }
        })
    }
}