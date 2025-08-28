const fs = require('fs');
const path = require('path');

module.exports = {
    route: (app) =>  {
        const groupsFile = path.join(__dirname, '../data/groups.json');

        // Function to read groups from file
        const readGroups = () => {
            const data = fs.readFileSync(groupsFile, 'utf8');
            const groups = JSON.parse(data);
            return Array.isArray(groups) ? groups : [];
        }

        // Function to write groups to file
        const writeGroups = (groups) => {
            fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2), 'utf8');
        }

        app.put('/api/editgroup/:groupId', (req, res) => {
            console.log('Received request to edit group:', req.body);
            if (!req.body || !req.params)  {
                return res.status(400).json({ error: 'Invalid request body or parameters.' });
            }

            const groupId = req.params.groupId;
            const newGroupName = req.body.newGroupName; 
            console.log('Editing group ID:', groupId, 'with new name:', newGroupName); 

            // Find the group by ID
            let groups = readGroups();
            const groupIndex = groups.findIndex(g => g.id === groupId);
            if (groupIndex === -1) {
                return res.status(404).json({ error: 'Group not found.' });
            }
            
            // Update the group name
            groups[groupIndex].groupname = newGroupName;

            try {
                writeGroups(groups);
                res.sendStatus(204);
            }
            catch (error) {
                console.error('Error editing groups file: ', error);
                res.status(500).json({ error: 'Failed to edit group.' });
            }
        })
    }
}